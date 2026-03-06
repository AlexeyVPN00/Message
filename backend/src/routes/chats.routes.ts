import { Router } from 'express';
import { chatsController } from '../controllers/chats.controller';
import { messagesController } from '../controllers/messages.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import {
  createMessageSchema,
  getMessagesSchema,
} from '../validators/messages.validator';

const router = Router();

// Все маршруты требуют аутентификации
router.use(authenticate);

// Чаты
router.get('/', chatsController.getUserChats.bind(chatsController));
router.post('/', chatsController.createPrivateChat.bind(chatsController));
router.post('/group', chatsController.createGroupChat.bind(chatsController));
router.get('/:id', chatsController.getChatById.bind(chatsController));
router.put('/:id', chatsController.updateGroupChat.bind(chatsController));

// Участники чата
router.get('/:id/members', chatsController.getChatMembers.bind(chatsController));
router.post('/:id/members', chatsController.addMember.bind(chatsController));
router.delete('/:id/members/:userId', chatsController.removeMember.bind(chatsController));
router.patch('/:id/members/:userId', chatsController.updateMemberRole.bind(chatsController));

// Сообщения чата
router.get('/:chatId/messages', validate(getMessagesSchema), messagesController.getMessages.bind(messagesController));
router.post('/:chatId/messages', validate(createMessageSchema), messagesController.createMessage.bind(messagesController));

export default router;
