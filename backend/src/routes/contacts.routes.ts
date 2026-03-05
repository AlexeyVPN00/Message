import { Router } from 'express';
import { contactsController } from '../controllers/contacts.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

// Все маршруты требуют аутентификации
router.use(authMiddleware);

// GET /api/contacts - получить список контактов (с опциональным поиском)
router.get('/', (req, res) => contactsController.getUserContacts(req, res));

// POST /api/contacts - добавить контакт
router.post('/', (req, res) => contactsController.addContact(req, res));

// DELETE /api/contacts/:contactId - удалить контакт
router.delete('/:contactId', (req, res) => contactsController.removeContact(req, res));

// GET /api/contacts/:contactId/check - проверить, находится ли пользователь в контактах
router.get('/:contactId/check', (req, res) => contactsController.checkContact(req, res));

export default router;
