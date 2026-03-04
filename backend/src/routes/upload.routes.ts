import { Router } from 'express';
import { uploadController } from '../controllers/upload.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { uploadAvatar, uploadMessageFile, uploadPostFile } from '../middlewares/upload.middleware';

const router = Router();

// Все маршруты требуют аутентификации
router.use(authenticate);

// POST /api/upload/avatar - Загрузить аватар
router.post('/avatar', uploadAvatar, uploadController.uploadAvatar.bind(uploadController));

// POST /api/upload/message - Загрузить файл для сообщения
router.post('/message', uploadMessageFile, uploadController.uploadMessageFile.bind(uploadController));

// POST /api/upload/post - Загрузить файлы для поста
router.post('/post', uploadPostFile, uploadController.uploadPostFiles.bind(uploadController));

export default router;
