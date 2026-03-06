import { Repository, LessThan, MoreThan } from 'typeorm';
import { AppDataSource } from '../config/database';
import { Message } from '../models/Message.entity';
import { chatsService } from './chats.service';
import { fileAttachmentsService } from './file-attachments.service';
import { AttachmentContext } from '../models/FileAttachment.entity';

export interface CreateMessageDto {
  chatId: string;
  senderId: string;
  content?: string; // Make optional - can send attachments without text
  replyToMessageId?: string;
  attachments?: Array<{
    fileName: string;
    fileUrl: string;
    fileSize: number;
    mimeType: string;
  }>;
}

export interface GetMessagesDto {
  chatId: string;
  userId: string;
  limit?: number;
  before?: string; // ID сообщения для пагинации (загрузка более старых)
  after?: string; // ID сообщения для пагинации (загрузка более новых)
}

export interface UpdateMessageDto {
  content: string;
}

export class MessagesService {
  private messageRepository: Repository<Message>;

  constructor() {
    this.messageRepository = AppDataSource.getRepository(Message);
  }

  /**
   * Получить сообщения чата с пагинацией
   */
  async getMessages(params: GetMessagesDto): Promise<Message[]> {
    const { chatId, userId, limit = 50, before, after } = params;

    // Проверяем, является ли пользователь участником чата
    const isMember = await chatsService.isMember(chatId, userId);
    if (!isMember) {
      throw new Error('Вы не являетесь участником этого чата');
    }

    const queryBuilder = this.messageRepository
      .createQueryBuilder('message')
      .where('message.chatId = :chatId', { chatId })
      .andWhere('message.isDeleted = :isDeleted', { isDeleted: false })
      .leftJoinAndSelect('message.sender', 'sender')
      .leftJoinAndSelect('message.replyToMessage', 'replyToMessage')
      .leftJoinAndSelect('replyToMessage.sender', 'replyToMessageSender')
      .leftJoinAndSelect('message.attachments', 'attachments')
      .orderBy('message.createdAt', 'DESC')
      .take(limit);

    // Пагинация: загрузка более старых сообщений
    if (before) {
      const beforeMessage = await this.messageRepository.findOne({
        where: { id: before },
      });
      if (beforeMessage) {
        queryBuilder.andWhere('message.createdAt < :beforeDate', {
          beforeDate: beforeMessage.createdAt,
        });
      }
    }

    // Пагинация: загрузка более новых сообщений
    if (after) {
      const afterMessage = await this.messageRepository.findOne({
        where: { id: after },
      });
      if (afterMessage) {
        queryBuilder.andWhere('message.createdAt > :afterDate', {
          afterDate: afterMessage.createdAt,
        });
      }
    }

    const messages = await queryBuilder.getMany();

    // Возвращаем в хронологическом порядке (от старых к новым)
    return messages.reverse();
  }

  /**
   * Создать новое сообщение
   */
  async createMessage(data: CreateMessageDto): Promise<Message> {
    const { chatId, senderId, content, replyToMessageId, attachments } = data;

    // Валидация: должен быть content ИЛИ attachments
    if (!content && (!attachments || attachments.length === 0)) {
      throw new Error('Сообщение должно содержать текст или вложения');
    }

    // Проверяем, является ли пользователь участником чата
    const isMember = await chatsService.isMember(chatId, senderId);
    if (!isMember) {
      throw new Error('Вы не являетесь участником этого чата');
    }

    // Создаем сообщение
    const message = this.messageRepository.create({
      chatId,
      senderId,
      content: content || '', // Empty string if only attachments
      replyToMessageId,
    });

    await this.messageRepository.save(message);

    // Создаем вложения если они есть
    if (attachments && attachments.length > 0) {
      const attachmentsData = attachments.map((file) => ({
        fileName: file.fileName,
        fileUrl: file.fileUrl,
        fileType: fileAttachmentsService.determineFileType(file.mimeType),
        fileSize: file.fileSize,
        mimeType: file.mimeType,
        context: AttachmentContext.MESSAGE,
        contextId: message.id,
        uploadedById: senderId,
      }));

      await fileAttachmentsService.createAttachments(attachmentsData);
    }

    // Обновляем updatedAt чата
    await AppDataSource.getRepository('Chat')
      .createQueryBuilder()
      .update()
      .set({ updatedAt: new Date() })
      .where('id = :chatId', { chatId })
      .execute();

    // Загружаем сообщение с отношениями (включая attachments)
    const savedMessage = await this.messageRepository.findOne({
      where: { id: message.id },
      relations: ['sender', 'replyToMessage', 'replyToMessage.sender', 'attachments'],
    });

    return savedMessage!;
  }

  /**
   * Получить сообщение по ID
   */
  async getMessageById(messageId: string, userId: string): Promise<Message | null> {
    const message = await this.messageRepository.findOne({
      where: { id: messageId },
      relations: ['sender', 'chat'],
    });

    if (!message) {
      return null;
    }

    // Проверяем, является ли пользователь участником чата
    const isMember = await chatsService.isMember(message.chatId, userId);
    if (!isMember) {
      throw new Error('Вы не являетесь участником этого чата');
    }

    return message;
  }

  /**
   * Обновить сообщение
   */
  async updateMessage(
    messageId: string,
    userId: string,
    data: UpdateMessageDto
  ): Promise<Message> {
    const message = await this.messageRepository.findOne({
      where: { id: messageId },
      relations: ['sender'],
    });

    if (!message) {
      throw new Error('Сообщение не найдено');
    }

    // Проверяем, является ли пользователь автором сообщения
    if (message.senderId !== userId) {
      throw new Error('Вы можете редактировать только свои сообщения');
    }

    message.content = data.content;
    message.isEdited = true;

    await this.messageRepository.save(message);

    // Загружаем обновленное сообщение с отношениями
    const updatedMessage = await this.messageRepository.findOne({
      where: { id: messageId },
      relations: ['sender', 'replyToMessage', 'replyToMessage.sender'],
    });

    return updatedMessage!;
  }

  /**
   * Удалить сообщение (soft delete)
   */
  async deleteMessage(messageId: string, userId: string): Promise<void> {
    const message = await this.messageRepository.findOne({
      where: { id: messageId },
    });

    if (!message) {
      throw new Error('Сообщение не найдено');
    }

    // Проверяем, является ли пользователь автором сообщения
    if (message.senderId !== userId) {
      throw new Error('Вы можете удалять только свои сообщения');
    }

    // Удаляем вложения (физические файлы и записи в БД)
    await fileAttachmentsService.deleteAttachmentsByContext(
      AttachmentContext.MESSAGE,
      messageId
    );

    message.isDeleted = true;
    message.content = 'Сообщение удалено';

    await this.messageRepository.save(message);
  }

  /**
   * Пометить сообщение как прочитанное
   */
  async markAsRead(messageId: string, userId: string): Promise<void> {
    const message = await this.messageRepository.findOne({
      where: { id: messageId },
    });

    if (!message) {
      throw new Error('Сообщение не найдено');
    }

    // Обновляем lastReadMessageId для пользователя в чате
    await chatsService.markMessagesAsRead(message.chatId, userId, messageId);
  }
}

export const messagesService = new MessagesService();
