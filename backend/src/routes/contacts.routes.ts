import { Router } from 'express';
import { contactsController } from '../controllers/contacts.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import {
  getUserContactsSchema,
  addContactSchema,
  removeContactSchema,
  checkContactSchema,
} from '../validators/contacts.validator';

const router = Router();

// Все маршруты требуют аутентификации
router.use(authMiddleware);

// GET /api/contacts - получить список контактов (с опциональным поиском)
router.get('/', validate(getUserContactsSchema), (req, res) => contactsController.getUserContacts(req, res));

// POST /api/contacts - добавить контакт
router.post('/', validate(addContactSchema), (req, res) => contactsController.addContact(req, res));

// DELETE /api/contacts/:contactId - удалить контакт
router.delete('/:contactId', validate(removeContactSchema), (req, res) => contactsController.removeContact(req, res));

// GET /api/contacts/:contactId/check - проверить, находится ли пользователь в контактах
router.get('/:contactId/check', validate(checkContactSchema), (req, res) => contactsController.checkContact(req, res));

export default router;
