import { Server as SocketIOServer } from 'socket.io';
import { AuthenticatedSocket } from '../config/socket';
import { messagesService } from '../services/messages.service';
import { chatsService } from '../services/chats.service';

export const registerChatHandlers = (io: SocketIOServer) => {
  io.on('connection', (socket: AuthenticatedSocket) => {
    const userId = socket.userId;

    if (!userId) {
      return;
    }

    /**
     * Присоединиться к комнате чата
     */
    socket.on('chat:join', async (data: { chatId: string }) => {
      try {
        const { chatId } = data;

        // Проверяем, является ли пользователь участником чата
        const isMember = await chatsService.isMember(chatId, userId);

        if (!isMember) {
          socket.emit('error', { message: 'Вы не являетесь участником этого чата' });
          return;
        }

        // Присоединяемся к комнате
        socket.join(chatId);
        console.log(`User ${userId} joined chat ${chatId}`);

        socket.emit('chat:joined', { chatId });
      } catch (error) {
        console.error('Error joining chat:', error);
        socket.emit('error', { message: 'Ошибка при присоединении к чату' });
      }
    });

    /**
     * Покинуть комнату чата
     */
    socket.on('chat:leave', (data: { chatId: string }) => {
      const { chatId } = data;
      socket.leave(chatId);
      console.log(`User ${userId} left chat ${chatId}`);
    });

    /**
     * Отправить сообщение
     */
    socket.on(
      'message:send',
      async (data: {
        chatId: string;
        content?: string;
        replyToMessageId?: string;
        attachments?: Array<{
          fileName: string;
          fileUrl: string;
          fileSize: number;
          mimeType: string;
        }>;
      }) => {
        try {
          const { chatId, content, replyToMessageId, attachments } = data;

          // Создаем сообщение через сервис
          const message = await messagesService.createMessage({
            chatId,
            senderId: userId,
            content,
            replyToMessageId,
            attachments,
          });

          // Отправляем сообщение всем участникам чата
          io.to(chatId).emit('message:new', message);

          console.log(`Message sent in chat ${chatId} by user ${userId}`);
        } catch (error) {
          console.error('Error sending message:', error);
          const errorMessage = error instanceof Error ? error.message : 'Ошибка при отправке сообщения';
          socket.emit('error', { message: errorMessage });
        }
      }
    );

    /**
     * Редактировать сообщение
     */
    socket.on('message:update', async (data: { messageId: string; content: string }) => {
      try {
        const { messageId, content } = data;

        // Обновляем сообщение
        const message = await messagesService.updateMessage(messageId, userId, { content });

        // Уведомляем всех участников чата об обновлении
        io.to(message.chatId).emit('message:updated', message);

        console.log(`Message ${messageId} updated by user ${userId}`);
      } catch (error) {
        console.error('Error updating message:', error);
        const errorMessage = error instanceof Error ? error.message : 'Ошибка при редактировании сообщения';
        socket.emit('error', { message: errorMessage });
      }
    });

    /**
     * Удалить сообщение
     */
    socket.on('message:delete', async (data: { messageId: string }) => {
      try {
        const { messageId } = data;

        // Получаем сообщение для получения chatId
        const message = await messagesService.getMessageById(messageId, userId);

        if (!message) {
          socket.emit('error', { message: 'Сообщение не найдено' });
          return;
        }

        const chatId = message.chatId;

        // Удаляем сообщение
        await messagesService.deleteMessage(messageId, userId);

        // Уведомляем всех участников чата об удалении
        io.to(chatId).emit('message:deleted', { messageId });

        console.log(`Message ${messageId} deleted by user ${userId}`);
      } catch (error) {
        console.error('Error deleting message:', error);
        const errorMessage = error instanceof Error ? error.message : 'Ошибка при удалении сообщения';
        socket.emit('error', { message: errorMessage });
      }
    });

    /**
     * Пользователь печатает
     */
    socket.on('chat:typing', async (data: { chatId: string }) => {
      try {
        const { chatId } = data;

        // Проверяем, является ли пользователь участником чата
        const isMember = await chatsService.isMember(chatId, userId);

        if (!isMember) {
          return;
        }

        // Уведомляем других участников чата (кроме отправителя)
        socket.to(chatId).emit('chat:typing', { chatId, userId });
      } catch (error) {
        console.error('Error handling typing:', error);
      }
    });

    /**
     * Пользователь прекратил печатать
     */
    socket.on('chat:stop_typing', async (data: { chatId: string }) => {
      try {
        const { chatId } = data;

        // Проверяем, является ли пользователь участником чата
        const isMember = await chatsService.isMember(chatId, userId);

        if (!isMember) {
          return;
        }

        // Уведомляем других участников чата (кроме отправителя)
        socket.to(chatId).emit('chat:stop_typing', { chatId, userId });
      } catch (error) {
        console.error('Error handling stop typing:', error);
      }
    });

    /**
     * Отметить сообщения как прочитанные
     */
    socket.on('message:read', async (data: { messageId: string }) => {
      try {
        const { messageId } = data;

        await messagesService.markAsRead(messageId, userId);

        // Можно уведомить отправителя о прочтении
        const message = await messagesService.getMessageById(messageId, userId);
        if (message) {
          socket.to(message.chatId).emit('message:read', { messageId, userId });
        }
      } catch (error) {
        console.error('Error marking message as read:', error);
      }
    });
  });
};
