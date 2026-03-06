import { Router } from 'express';
import { messagesController } from '../controllers/messages.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import {
  updateMessageSchema,
  deleteMessageSchema,
  markAsReadSchema,
} from '../validators/messages.validator';

const router = Router();

// Все маршруты требуют аутентификации
router.use(authenticate);

// GET /api/messages/:id - Получить сообщение по ID
router.get('/:id', messagesController.getMessageById.bind(messagesController));

// PUT /api/messages/:id - Редактировать сообщение
router.put('/:id', validate(updateMessageSchema), messagesController.updateMessage.bind(messagesController));

// DELETE /api/messages/:id - Удалить сообщение
router.delete('/:id', validate(deleteMessageSchema), messagesController.deleteMessage.bind(messagesController));

// POST /api/messages/:id/read - Отметить как прочитанное
router.post('/:id/read', validate(markAsReadSchema), messagesController.markAsRead.bind(messagesController));

export default router;
