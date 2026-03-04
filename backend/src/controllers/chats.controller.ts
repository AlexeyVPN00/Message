import { Request, Response } from 'express';
import { chatsService } from '../services/chats.service';

export class ChatsController {
  /**
   * GET /api/chats - Получить список чатов пользователя
   */
  async getUserChats(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({ message: 'Не авторизован' });
        return;
      }

      const chats = await chatsService.getUserChats(userId);

      res.json(chats);
    } catch (error) {
      console.error('Error getting user chats:', error);
      res.status(500).json({ message: 'Ошибка при получении чатов' });
    }
  }

  /**
   * POST /api/chats - Создать или получить приватный чат
   */
  async createPrivateChat(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      const { participantId } = req.body;

      if (!userId) {
        res.status(401).json({ message: 'Не авторизован' });
        return;
      }

      if (!participantId) {
        res.status(400).json({ message: 'participantId обязателен' });
        return;
      }

      if (participantId === userId) {
        res.status(400).json({ message: 'Нельзя создать чат с самим собой' });
        return;
      }

      const chat = await chatsService.getOrCreatePrivateChat(userId, participantId);

      res.json(chat);
    } catch (error) {
      console.error('Error creating private chat:', error);
      const message = error instanceof Error ? error.message : 'Ошибка при создании чата';
      res.status(400).json({ message });
    }
  }

  /**
   * GET /api/chats/:id - Получить информацию о чате
   */
  async getChatById(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      const chatId = req.params.id;

      if (!userId) {
        res.status(401).json({ message: 'Не авторизован' });
        return;
      }

      const chat = await chatsService.getChatById(chatId, userId);

      if (!chat) {
        res.status(404).json({ message: 'Чат не найден' });
        return;
      }

      res.json(chat);
    } catch (error) {
      console.error('Error getting chat:', error);
      const message = error instanceof Error ? error.message : 'Ошибка при получении чата';
      res.status(403).json({ message });
    }
  }

  /**
   * POST /api/chats/group - Создать групповой чат
   */
  async createGroupChat(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      const { name, description, memberIds } = req.body;

      if (!userId) {
        res.status(401).json({ message: 'Не авторизован' });
        return;
      }

      if (!name || !name.trim()) {
        res.status(400).json({ message: 'Название группы обязательно' });
        return;
      }

      if (!memberIds || !Array.isArray(memberIds) || memberIds.length === 0) {
        res.status(400).json({ message: 'Необходимо добавить хотя бы одного участника' });
        return;
      }

      const chat = await chatsService.createGroupChat(userId, {
        name: name.trim(),
        description: description?.trim(),
        memberIds,
      });

      res.status(201).json(chat);
    } catch (error) {
      console.error('Error creating group chat:', error);
      const message = error instanceof Error ? error.message : 'Ошибка при создании группы';
      res.status(400).json({ message });
    }
  }

  /**
   * PUT /api/chats/:id - Обновить групповой чат
   */
  async updateGroupChat(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      const chatId = req.params.id;
      const { name, description, avatarUrl } = req.body;

      if (!userId) {
        res.status(401).json({ message: 'Не авторизован' });
        return;
      }

      const chat = await chatsService.updateGroupChat(chatId, userId, {
        name: name?.trim(),
        description: description?.trim(),
        avatarUrl,
      });

      res.json(chat);
    } catch (error) {
      console.error('Error updating group chat:', error);
      const message = error instanceof Error ? error.message : 'Ошибка при обновлении группы';
      res.status(403).json({ message });
    }
  }

  /**
   * GET /api/chats/:id/members - Получить участников чата
   */
  async getChatMembers(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      const chatId = req.params.id;

      if (!userId) {
        res.status(401).json({ message: 'Не авторизован' });
        return;
      }

      const members = await chatsService.getChatMembers(chatId, userId);

      res.json(members);
    } catch (error) {
      console.error('Error getting chat members:', error);
      const message = error instanceof Error ? error.message : 'Ошибка при получении участников';
      res.status(403).json({ message });
    }
  }

  /**
   * POST /api/chats/:id/members - Добавить участника
   */
  async addMember(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      const chatId = req.params.id;
      const { userId: newUserId, role } = req.body;

      if (!userId) {
        res.status(401).json({ message: 'Не авторизован' });
        return;
      }

      if (!newUserId) {
        res.status(400).json({ message: 'userId обязателен' });
        return;
      }

      const member = await chatsService.addMember(chatId, userId, {
        userId: newUserId,
        role,
      });

      res.status(201).json(member);
    } catch (error) {
      console.error('Error adding member:', error);
      const message = error instanceof Error ? error.message : 'Ошибка при добавлении участника';
      res.status(403).json({ message });
    }
  }

  /**
   * DELETE /api/chats/:id/members/:userId - Удалить участника
   */
  async removeMember(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      const chatId = req.params.id;
      const memberIdToRemove = req.params.userId;

      if (!userId) {
        res.status(401).json({ message: 'Не авторизован' });
        return;
      }

      await chatsService.removeMember(chatId, userId, memberIdToRemove);

      res.json({ message: 'Участник удален' });
    } catch (error) {
      console.error('Error removing member:', error);
      const message = error instanceof Error ? error.message : 'Ошибка при удалении участника';
      res.status(403).json({ message });
    }
  }

  /**
   * PATCH /api/chats/:id/members/:userId - Изменить роль участника
   */
  async updateMemberRole(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      const chatId = req.params.id;
      const memberIdToUpdate = req.params.userId;
      const { role } = req.body;

      if (!userId) {
        res.status(401).json({ message: 'Не авторизован' });
        return;
      }

      if (!role) {
        res.status(400).json({ message: 'role обязателен' });
        return;
      }

      const member = await chatsService.updateMemberRole(chatId, userId, memberIdToUpdate, {
        role,
      });

      res.json(member);
    } catch (error) {
      console.error('Error updating member role:', error);
      const message = error instanceof Error ? error.message : 'Ошибка при изменении роли';
      res.status(403).json({ message });
    }
  }
}

export const chatsController = new ChatsController();
