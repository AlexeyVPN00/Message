import { Router } from 'express';
import { messagesController } from '../controllers/messages.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

// Все маршруты требуют аутентификации
router.use(authenticate);

// GET /api/messages/:id - Получить сообщение по ID
router.get('/:id', messagesController.getMessageById.bind(messagesController));

// PUT /api/messages/:id - Редактировать сообщение
router.put('/:id', messagesController.updateMessage.bind(messagesController));

// DELETE /api/messages/:id - Удалить сообщение
router.delete('/:id', messagesController.deleteMessage.bind(messagesController));

// POST /api/messages/:id/read - Отметить как прочитанное
router.post('/:id/read', messagesController.markAsRead.bind(messagesController));

export default router;
