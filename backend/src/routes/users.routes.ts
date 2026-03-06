import { Router } from 'express';
import { usersController } from '../controllers/users.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import {
  searchUsersSchema,
  getUserByIdSchema,
  updateUserSchema,
  deleteAvatarSchema,
} from '../validators/users.validator';

const router = Router();

// Все маршруты требуют аутентификации
router.use(authenticate);

// GET /api/users - Поиск пользователей
router.get('/', validate(searchUsersSchema), usersController.searchUsers.bind(usersController));

// GET /api/users/:id - Получить пользователя по ID
router.get('/:id', validate(getUserByIdSchema), usersController.getUserById.bind(usersController));

// PUT /api/users/:id - Обновить профиль
router.put('/:id', validate(updateUserSchema), usersController.updateUser.bind(usersController));

// DELETE /api/users/:id/avatar - Удалить аватар
router.delete('/:id/avatar', validate(deleteAvatarSchema), usersController.deleteAvatar.bind(usersController));

export default router;
