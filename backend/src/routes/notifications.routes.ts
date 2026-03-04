import { Router } from 'express';
import { notificationsController } from '../controllers/notifications.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

// Все маршруты требуют аутентификации
router.use(authenticate);

// Уведомления
router.get('/', notificationsController.getUserNotifications.bind(notificationsController));
router.get('/unread-count', notificationsController.getUnreadCount.bind(notificationsController));
router.put('/read-all', notificationsController.markAllAsRead.bind(notificationsController));
router.put('/:id/read', notificationsController.markAsRead.bind(notificationsController));
router.delete('/read', notificationsController.deleteAllRead.bind(notificationsController));
router.delete('/:id', notificationsController.deleteNotification.bind(notificationsController));

export default router;
