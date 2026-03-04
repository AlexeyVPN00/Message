import { Repository, In } from 'typeorm';
import { AppDataSource } from '../config/database';
import { Chat, ChatType } from '../models/Chat.entity';
import { ChatMember, MemberRole } from '../models/ChatMember.entity';
import { User } from '../models/User.entity';
import { Message } from '../models/Message.entity';

export interface CreatePrivateChatDto {
  participantId: string;
}

export interface CreateGroupChatDto {
  name: string;
  description?: string;
  memberIds: string[]; // ID участников (без создателя)
}

export interface UpdateGroupChatDto {
  name?: string;
  description?: string;
  avatarUrl?: string;
}

export interface AddMemberDto {
  userId: string;
  role?: MemberRole;
}

export interface UpdateMemberRoleDto {
  role: MemberRole;
}

export interface ChatWithDetails extends Chat {
  lastMessage?: Message;
  unreadCount?: number;
}

export class ChatsService {
  private chatRepository: Repository<Chat>;
  private chatMemberRepository: Repository<ChatMember>;
  private messageRepository: Repository<Message>;
  private userRepository: Repository<User>;

  constructor() {
    this.chatRepository = AppDataSource.getRepository(Chat);
    this.chatMemberRepository = AppDataSource.getRepository(ChatMember);
    this.messageRepository = AppDataSource.getRepository(Message);
    this.userRepository = AppDataSource.getRepository(User);
  }

  /**
   * Получить список чатов пользователя
   */
  async getUserChats(userId: string): Promise<ChatWithDetails[]> {
    // Получаем все чаты, где пользователь является участником
    const chatMembers = await this.chatMemberRepository.find({
      where: { userId },
      relations: ['chat'],
    });

    const chatIds = chatMembers.map((cm) => cm.chatId);

    if (chatIds.length === 0) {
      return [];
    }

    // Получаем полную информацию о чатах
    const chats = await this.chatRepository.find({
      where: { id: In(chatIds) },
      relations: ['members', 'members.user'],
      order: { updatedAt: 'DESC' },
    });

    // Для каждого чата получаем последнее сообщение и количество непрочитанных
    const chatsWithDetails: ChatWithDetails[] = await Promise.all(
      chats.map(async (chat) => {
        // Последнее сообщение
        const lastMessage = await this.messageRepository.findOne({
          where: { chatId: chat.id },
          order: { createdAt: 'DESC' },
          relations: ['sender'],
        });

        // Количество непрочитанных сообщений
        const currentMember = chatMembers.find((cm) => cm.chatId === chat.id);
        let unreadCount = 0;

        if (currentMember?.lastReadMessageId) {
          unreadCount = await this.messageRepository.count({
            where: {
              chatId: chat.id,
              createdAt: lastMessage?.createdAt,
            },
          });
        } else if (lastMessage) {
          // Если пользователь никогда не читал сообщения, считаем все непрочитанными
          unreadCount = await this.messageRepository.count({
            where: { chatId: chat.id },
          });
        }

        return {
          ...chat,
          lastMessage,
          unreadCount,
        };
      })
    );

    return chatsWithDetails;
  }

  /**
   * Получить или создать приватный чат между двумя пользователями
   */
  async getOrCreatePrivateChat(userId: string, participantId: string): Promise<Chat> {
    // Проверяем, существует ли уже приватный чат между этими пользователями
    const existingChat = await this.findPrivateChat(userId, participantId);

    if (existingChat) {
      return existingChat;
    }

    // Создаем новый приватный чат
    const chat = this.chatRepository.create({
      type: ChatType.PRIVATE,
      createdBy: userId,
    });

    await this.chatRepository.save(chat);

    // Добавляем участников
    const member1 = this.chatMemberRepository.create({
      chatId: chat.id,
      userId: userId,
      role: MemberRole.MEMBER,
    });

    const member2 = this.chatMemberRepository.create({
      chatId: chat.id,
      userId: participantId,
      role: MemberRole.MEMBER,
    });

    await this.chatMemberRepository.save([member1, member2]);

    // Загружаем чат с участниками
    const chatWithMembers = await this.chatRepository.findOne({
      where: { id: chat.id },
      relations: ['members', 'members.user'],
    });

    return chatWithMembers!;
  }

  /**
   * Найти приватный чат между двумя пользователями
   */
  private async findPrivateChat(userId1: string, userId2: string): Promise<Chat | null> {
    // Получаем чаты первого пользователя
    const user1Chats = await this.chatMemberRepository.find({
      where: { userId: userId1 },
      relations: ['chat'],
    });

    // Получаем чаты второго пользователя
    const user2Chats = await this.chatMemberRepository.find({
      where: { userId: userId2 },
      relations: ['chat'],
    });

    // Находим общие приватные чаты
    const commonChat = user1Chats.find((cm1) =>
      user2Chats.some(
        (cm2) =>
          cm2.chatId === cm1.chatId &&
          cm1.chat.type === ChatType.PRIVATE
      )
    );

    if (!commonChat) {
      return null;
    }

    // Загружаем чат с участниками
    const chat = await this.chatRepository.findOne({
      where: { id: commonChat.chatId },
      relations: ['members', 'members.user'],
    });

    return chat;
  }

  /**
   * Получить информацию о чате
   */
  async getChatById(chatId: string, userId: string): Promise<Chat | null> {
    // Проверяем, является ли пользователь участником чата
    const member = await this.chatMemberRepository.findOne({
      where: { chatId, userId },
    });

    if (!member) {
      throw new Error('Вы не являетесь участником этого чата');
    }

    const chat = await this.chatRepository.findOne({
      where: { id: chatId },
      relations: ['members', 'members.user'],
    });

    return chat;
  }

  /**
   * Пометить сообщения как прочитанные
   */
  async markMessagesAsRead(chatId: string, userId: string, messageId: string): Promise<void> {
    const member = await this.chatMemberRepository.findOne({
      where: { chatId, userId },
    });

    if (!member) {
      throw new Error('Вы не являетесь участником этого чата');
    }

    member.lastReadMessageId = messageId;
    await this.chatMemberRepository.save(member);
  }

  /**
   * Проверить, является ли пользователь участником чата
   */
  async isMember(chatId: string, userId: string): Promise<boolean> {
    const member = await this.chatMemberRepository.findOne({
      where: { chatId, userId },
    });

    return !!member;
  }

  /**
   * Создать групповой чат
   */
  async createGroupChat(userId: string, data: CreateGroupChatDto): Promise<Chat> {
    const { name, description, memberIds } = data;

    // Создаем групповой чат
    const chat = this.chatRepository.create({
      type: ChatType.GROUP,
      name,
      description,
      createdBy: userId,
    });

    await this.chatRepository.save(chat);

    // Добавляем создателя как владельца
    const ownerMember = this.chatMemberRepository.create({
      chatId: chat.id,
      userId: userId,
      role: MemberRole.OWNER,
    });

    // Добавляем остальных участников как обычных членов
    const members = memberIds.map((memberId) =>
      this.chatMemberRepository.create({
        chatId: chat.id,
        userId: memberId,
        role: MemberRole.MEMBER,
      })
    );

    await this.chatMemberRepository.save([ownerMember, ...members]);

    // Загружаем чат с участниками
    const chatWithMembers = await this.chatRepository.findOne({
      where: { id: chat.id },
      relations: ['members', 'members.user'],
    });

    return chatWithMembers!;
  }

  /**
   * Обновить информацию о группе
   */
  async updateGroupChat(
    chatId: string,
    userId: string,
    data: UpdateGroupChatDto
  ): Promise<Chat> {
    // Проверяем права доступа
    const member = await this.chatMemberRepository.findOne({
      where: { chatId, userId },
    });

    if (!member) {
      throw new Error('Вы не являетесь участником этого чата');
    }

    if (member.role !== MemberRole.OWNER && member.role !== MemberRole.ADMIN) {
      throw new Error('Недостаточно прав для редактирования группы');
    }

    const chat = await this.chatRepository.findOne({ where: { id: chatId } });

    if (!chat) {
      throw new Error('Чат не найден');
    }

    if (chat.type !== ChatType.GROUP) {
      throw new Error('Это не групповой чат');
    }

    // Обновляем данные
    if (data.name !== undefined) chat.name = data.name;
    if (data.description !== undefined) chat.description = data.description;
    if (data.avatarUrl !== undefined) chat.avatarUrl = data.avatarUrl;

    await this.chatRepository.save(chat);

    // Загружаем обновленный чат
    const updatedChat = await this.chatRepository.findOne({
      where: { id: chatId },
      relations: ['members', 'members.user'],
    });

    return updatedChat!;
  }

  /**
   * Добавить участника в группу
   */
  async addMember(chatId: string, userId: string, data: AddMemberDto): Promise<ChatMember> {
    // Проверяем права доступа
    const requestingMember = await this.chatMemberRepository.findOne({
      where: { chatId, userId },
    });

    if (!requestingMember) {
      throw new Error('Вы не являетесь участником этого чата');
    }

    if (requestingMember.role !== MemberRole.OWNER && requestingMember.role !== MemberRole.ADMIN) {
      throw new Error('Недостаточно прав для добавления участников');
    }

    // Проверяем, не является ли пользователь уже участником
    const existingMember = await this.chatMemberRepository.findOne({
      where: { chatId, userId: data.userId },
    });

    if (existingMember) {
      throw new Error('Пользователь уже является участником чата');
    }

    // Добавляем участника
    const newMember = this.chatMemberRepository.create({
      chatId,
      userId: data.userId,
      role: data.role || MemberRole.MEMBER,
    });

    await this.chatMemberRepository.save(newMember);

    // Загружаем участника с данными пользователя
    const memberWithUser = await this.chatMemberRepository.findOne({
      where: { id: newMember.id },
      relations: ['user'],
    });

    return memberWithUser!;
  }

  /**
   * Удалить участника из группы
   */
  async removeMember(chatId: string, userId: string, memberIdToRemove: string): Promise<void> {
    // Проверяем права доступа
    const requestingMember = await this.chatMemberRepository.findOne({
      where: { chatId, userId },
    });

    if (!requestingMember) {
      throw new Error('Вы не являетесь участником этого чата');
    }

    // Получаем участника, которого хотим удалить
    const memberToRemove = await this.chatMemberRepository.findOne({
      where: { chatId, userId: memberIdToRemove },
    });

    if (!memberToRemove) {
      throw new Error('Участник не найден');
    }

    // Владелец может удалять всех, админ может удалять обычных участников
    if (requestingMember.role === MemberRole.OWNER) {
      // Владелец может удалять всех, кроме себя
      if (memberIdToRemove === userId) {
        throw new Error('Владелец не может удалить себя из группы');
      }
    } else if (requestingMember.role === MemberRole.ADMIN) {
      // Админ может удалять только обычных участников
      if (memberToRemove.role !== MemberRole.MEMBER) {
        throw new Error('Недостаточно прав для удаления этого участника');
      }
    } else {
      // Обычный участник может удалить только себя
      if (memberIdToRemove !== userId) {
        throw new Error('Недостаточно прав для удаления участников');
      }
    }

    await this.chatMemberRepository.remove(memberToRemove);
  }

  /**
   * Изменить роль участника
   */
  async updateMemberRole(
    chatId: string,
    userId: string,
    memberIdToUpdate: string,
    data: UpdateMemberRoleDto
  ): Promise<ChatMember> {
    // Проверяем права доступа
    const requestingMember = await this.chatMemberRepository.findOne({
      where: { chatId, userId },
    });

    if (!requestingMember) {
      throw new Error('Вы не являетесь участником этого чата');
    }

    // Только владелец может изменять роли
    if (requestingMember.role !== MemberRole.OWNER) {
      throw new Error('Только владелец может изменять роли участников');
    }

    // Получаем участника, которому хотим изменить роль
    const memberToUpdate = await this.chatMemberRepository.findOne({
      where: { chatId, userId: memberIdToUpdate },
    });

    if (!memberToUpdate) {
      throw new Error('Участник не найден');
    }

    // Нельзя изменить роль владельца
    if (memberToUpdate.role === MemberRole.OWNER) {
      throw new Error('Нельзя изменить роль владельца');
    }

    memberToUpdate.role = data.role;
    await this.chatMemberRepository.save(memberToUpdate);

    // Загружаем обновленного участника
    const updatedMember = await this.chatMemberRepository.findOne({
      where: { id: memberToUpdate.id },
      relations: ['user'],
    });

    return updatedMember!;
  }

  /**
   * Получить участников чата
   */
  async getChatMembers(chatId: string, userId: string): Promise<ChatMember[]> {
    // Проверяем, является ли пользователь участником
    const isMember = await this.isMember(chatId, userId);

    if (!isMember) {
      throw new Error('Вы не являетесь участником этого чата');
    }

    const members = await this.chatMemberRepository.find({
      where: { chatId },
      relations: ['user'],
      order: { role: 'ASC', joinedAt: 'ASC' },
    });

    return members;
  }
}

export const chatsService = new ChatsService();
