import { Request, Response } from 'express';
import { messagesService } from '../services/messages.service';

export class MessagesController {
  /**
   * GET /api/chats/:chatId/messages - Получить сообщения чата
   */
  async getMessages(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      const chatId = req.params.chatId;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      const before = req.query.before as string | undefined;
      const after = req.query.after as string | undefined;

      if (!userId) {
        res.status(401).json({ message: 'Не авторизован' });
        return;
      }

      const messages = await messagesService.getMessages({
        chatId,
        userId,
        limit,
        before,
        after,
      });

      res.json(messages);
    } catch (error) {
      console.error('Error getting messages:', error);
      const message = error instanceof Error ? error.message : 'Ошибка при получении сообщений';
      res.status(403).json({ message });
    }
  }

  /**
   * POST /api/chats/:chatId/messages - Отправить сообщение
   */
  async createMessage(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      const chatId = req.params.chatId;
      const { content, replyToMessageId } = req.body;

      if (!userId) {
        res.status(401).json({ message: 'Не авторизован' });
        return;
      }

      if (!content || content.trim().length === 0) {
        res.status(400).json({ message: 'Сообщение не может быть пустым' });
        return;
      }

      const message = await messagesService.createMessage({
        chatId,
        senderId: userId,
        content: content.trim(),
        replyToMessageId,
      });

      res.status(201).json(message);
    } catch (error) {
      console.error('Error creating message:', error);
      const message = error instanceof Error ? error.message : 'Ошибка при отправке сообщения';
      res.status(403).json({ message });
    }
  }

  /**
   * GET /api/messages/:id - Получить сообщение по ID
   */
  async getMessageById(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      const messageId = req.params.id;

      if (!userId) {
        res.status(401).json({ message: 'Не авторизован' });
        return;
      }

      const message = await messagesService.getMessageById(messageId, userId);

      if (!message) {
        res.status(404).json({ message: 'Сообщение не найдено' });
        return;
      }

      res.json(message);
    } catch (error) {
      console.error('Error getting message:', error);
      const message = error instanceof Error ? error.message : 'Ошибка при получении сообщения';
      res.status(403).json({ message });
    }
  }

  /**
   * PUT /api/messages/:id - Редактировать сообщение
   */
  async updateMessage(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      const messageId = req.params.id;
      const { content } = req.body;

      if (!userId) {
        res.status(401).json({ message: 'Не авторизован' });
        return;
      }

      if (!content || content.trim().length === 0) {
        res.status(400).json({ message: 'Сообщение не может быть пустым' });
        return;
      }

      const message = await messagesService.updateMessage(messageId, userId, {
        content: content.trim(),
      });

      res.json(message);
    } catch (error) {
      console.error('Error updating message:', error);
      const message = error instanceof Error ? error.message : 'Ошибка при редактировании сообщения';
      res.status(403).json({ message });
    }
  }

  /**
   * DELETE /api/messages/:id - Удалить сообщение
   */
  async deleteMessage(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      const messageId = req.params.id;

      if (!userId) {
        res.status(401).json({ message: 'Не авторизован' });
        return;
      }

      await messagesService.deleteMessage(messageId, userId);

      res.json({ message: 'Сообщение удалено' });
    } catch (error) {
      console.error('Error deleting message:', error);
      const message = error instanceof Error ? error.message : 'Ошибка при удалении сообщения';
      res.status(403).json({ message });
    }
  }

  /**
   * POST /api/messages/:id/read - Отметить сообщение как прочитанное
   */
  async markAsRead(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      const messageId = req.params.id;

      if (!userId) {
        res.status(401).json({ message: 'Не авторизован' });
        return;
      }

      await messagesService.markAsRead(messageId, userId);

      res.json({ message: 'Сообщение отмечено как прочитанное' });
    } catch (error) {
      console.error('Error marking message as read:', error);
      const message = error instanceof Error ? error.message : 'Ошибка при отметке сообщения';
      res.status(403).json({ message });
    }
  }
}

export const messagesController = new MessagesController();
