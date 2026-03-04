import { Request, Response } from 'express';
import { usersService } from '../services/users.service';

export class UsersController {
  /**
   * GET /api/users - Поиск пользователей
   */
  async searchUsers(req: Request, res: Response): Promise<void> {
    try {
      const search = req.query.search as string | undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
      const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;

      const result = await usersService.searchUsers({ search, limit, offset });

      res.json(result);
    } catch (error) {
      console.error('Error searching users:', error);
      res.status(500).json({ message: 'Ошибка при поиске пользователей' });
    }
  }

  /**
   * GET /api/users/:id - Получить пользователя по ID
   */
  async getUserById(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.params.id;

      const user = await usersService.getUserById(userId);

      if (!user) {
        res.status(404).json({ message: 'Пользователь не найден' });
        return;
      }

      res.json(user);
    } catch (error) {
      console.error('Error getting user:', error);
      res.status(500).json({ message: 'Ошибка при получении пользователя' });
    }
  }

  /**
   * PUT /api/users/:id - Обновить профиль
   */
  async updateUser(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.params.id;
      const currentUserId = req.user?.userId;

      // Проверка прав доступа - пользователь может обновлять только свой профиль
      if (userId !== currentUserId) {
        res.status(403).json({ message: 'Нет прав для редактирования этого профиля' });
        return;
      }

      const { firstName, lastName, bio, phone } = req.body;

      const updatedUser = await usersService.updateUser(userId, {
        firstName,
        lastName,
        bio,
        phone,
      });

      res.json(updatedUser);
    } catch (error) {
      console.error('Error updating user:', error);
      const message = error instanceof Error ? error.message : 'Ошибка при обновлении профиля';
      res.status(400).json({ message });
    }
  }

  /**
   * DELETE /api/users/:id/avatar - Удалить аватар
   */
  async deleteAvatar(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.params.id;
      const currentUserId = req.user?.userId;

      // Проверка прав доступа
      if (userId !== currentUserId) {
        res.status(403).json({ message: 'Нет прав для удаления аватара' });
        return;
      }

      const updatedUser = await usersService.deleteAvatar(userId);

      res.json(updatedUser);
    } catch (error) {
      console.error('Error deleting avatar:', error);
      const message = error instanceof Error ? error.message : 'Ошибка при удалении аватара';
      res.status(400).json({ message });
    }
  }
}

export const usersController = new UsersController();
