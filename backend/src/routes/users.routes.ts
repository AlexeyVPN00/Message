import { Router } from 'express';
import { usersController } from '../controllers/users.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

// Все маршруты требуют аутентификации
router.use(authenticate);

// GET /api/users - Поиск пользователей
router.get('/', usersController.searchUsers.bind(usersController));

// GET /api/users/:id - Получить пользователя по ID
router.get('/:id', usersController.getUserById.bind(usersController));

// PUT /api/users/:id - Обновить профиль
router.put('/:id', usersController.updateUser.bind(usersController));

// DELETE /api/users/:id/avatar - Удалить аватар
router.delete('/:id/avatar', usersController.deleteAvatar.bind(usersController));

export default router;
