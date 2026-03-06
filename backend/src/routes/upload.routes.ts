import { Router } from 'express';
import { uploadController } from '../controllers/upload.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { uploadAvatar, uploadMessageFile, uploadMessageFiles, uploadPostFile } from '../middlewares/upload.middleware';

const router = Router();

// Все маршруты требуют аутентификации
router.use(authenticate);

// POST /api/upload/avatar - Загрузить аватар
router.post('/avatar', uploadAvatar, uploadController.uploadAvatar.bind(uploadController));

// POST /api/upload/group-avatar/:chatId - Загрузить аватар группы
router.post('/group-avatar/:chatId', uploadAvatar, uploadController.uploadGroupAvatar.bind(uploadController));

// POST /api/upload/message - Загрузить файл для сообщения
router.post('/message', uploadMessageFile, uploadController.uploadMessageFile.bind(uploadController));

// POST /api/upload/messages - Загрузить файлы для сообщений (множественные)
router.post('/messages', uploadMessageFiles, uploadController.uploadMessageFiles.bind(uploadController));

// POST /api/upload/post - Загрузить файлы для поста
router.post('/post', uploadPostFile, uploadController.uploadPostFiles.bind(uploadController));

export default router;
