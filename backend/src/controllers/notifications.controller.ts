import { Request, Response } from 'express';
import { notificationsService } from '../services/notifications.service';

export class NotificationsController {
  /**
   * GET /api/notifications - Получить уведомления пользователя
   */
  async getUserNotifications(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({ message: 'Не авторизован' });
        return;
      }

      const unreadOnly = req.query.unreadOnly === 'true';
      const limit = parseInt(req.query.limit as string) || 50;

      const notifications = await notificationsService.getUserNotifications(userId, unreadOnly, limit);

      res.json(notifications);
    } catch (error) {
      console.error('Error getting notifications:', error);
      res.status(500).json({ message: 'Ошибка при получении уведомлений' });
    }
  }

  /**
   * GET /api/notifications/unread-count - Получить количество непрочитанных
   */
  async getUnreadCount(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({ message: 'Не авторизован' });
        return;
      }

      const count = await notificationsService.getUnreadCount(userId);

      res.json({ count });
    } catch (error) {
      console.error('Error getting unread count:', error);
      res.status(500).json({ message: 'Ошибка при получении счетчика' });
    }
  }

  /**
   * PUT /api/notifications/:id/read - Отметить как прочитанное
   */
  async markAsRead(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      const notificationId = req.params.id;

      if (!userId) {
        res.status(401).json({ message: 'Не авторизован' });
        return;
      }

      const notification = await notificationsService.markAsRead(notificationId, userId);

      res.json(notification);
    } catch (error) {
      console.error('Error marking notification as read:', error);
      const message = error instanceof Error ? error.message : 'Ошибка при обновлении уведомления';
      res.status(404).json({ message });
    }
  }

  /**
   * PUT /api/notifications/read-all - Отметить все как прочитанные
   */
  async markAllAsRead(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({ message: 'Не авторизован' });
        return;
      }

      await notificationsService.markAllAsRead(userId);

      res.json({ message: 'Все уведомления отмечены как прочитанные' });
    } catch (error) {
      console.error('Error marking all as read:', error);
      res.status(500).json({ message: 'Ошибка при обновлении уведомлений' });
    }
  }

  /**
   * DELETE /api/notifications/:id - Удалить уведомление
   */
  async deleteNotification(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      const notificationId = req.params.id;

      if (!userId) {
        res.status(401).json({ message: 'Не авторизован' });
        return;
      }

      await notificationsService.deleteNotification(notificationId, userId);

      res.json({ message: 'Уведомление удалено' });
    } catch (error) {
      console.error('Error deleting notification:', error);
      const message = error instanceof Error ? error.message : 'Ошибка при удалении уведомления';
      res.status(404).json({ message });
    }
  }

  /**
   * DELETE /api/notifications/read - Удалить все прочитанные
   */
  async deleteAllRead(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({ message: 'Не авторизован' });
        return;
      }

      await notificationsService.deleteAllRead(userId);

      res.json({ message: 'Прочитанные уведомления удалены' });
    } catch (error) {
      console.error('Error deleting read notifications:', error);
      res.status(500).json({ message: 'Ошибка при удалении уведомлений' });
    }
  }
}

export const notificationsController = new NotificationsController();
