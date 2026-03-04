import { Request, Response } from 'express';
import { uploadService } from '../services/upload.service';
import { usersService } from '../services/users.service';

export class UploadController {
  /**
   * POST /api/upload/avatar - Загрузить аватар
   */
  async uploadAvatar(req: Request, res: Response): Promise<void> {
    try {
      if (!req.file) {
        res.status(400).json({ message: 'Файл не был загружен' });
        return;
      }

      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ message: 'Не авторизован' });
        return;
      }

      // Получаем текущего пользователя для удаления старого аватара
      const user = await usersService.getUserById(userId);
      if (user?.avatarUrl) {
        await uploadService.deleteOldAvatar(user.avatarUrl);
      }

      // Обрабатываем изображение (ресайз, оптимизация)
      const processedPath = await uploadService.processAvatar(req.file.path);

      // Получаем URL файла
      const avatarUrl = uploadService.getFileUrl(processedPath);

      // Обновляем аватар в БД
      const updatedUser = await usersService.updateAvatar(userId, avatarUrl);

      res.json({
        message: 'Аватар успешно загружен',
        avatarUrl,
        user: updatedUser,
      });
    } catch (error) {
      console.error('Error uploading avatar:', error);
      const message = error instanceof Error ? error.message : 'Ошибка при загрузке аватара';
      res.status(500).json({ message });
    }
  }

  /**
   * POST /api/upload/message - Загрузить файл для сообщения
   */
  async uploadMessageFile(req: Request, res: Response): Promise<void> {
    try {
      if (!req.file) {
        res.status(400).json({ message: 'Файл не был загружен' });
        return;
      }

      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ message: 'Не авторизован' });
        return;
      }

      const fileUrl = uploadService.getFileUrl(req.file.path);

      res.json({
        message: 'Файл успешно загружен',
        fileUrl,
        fileName: req.file.originalname,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
      });
    } catch (error) {
      console.error('Error uploading message file:', error);
      const message = error instanceof Error ? error.message : 'Ошибка при загрузке файла';
      res.status(500).json({ message });
    }
  }

  /**
   * POST /api/upload/post - Загрузить файлы для поста
   */
  async uploadPostFiles(req: Request, res: Response): Promise<void> {
    try {
      if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
        res.status(400).json({ message: 'Файлы не были загружены' });
        return;
      }

      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ message: 'Не авторизован' });
        return;
      }

      const uploadedFiles = req.files.map((file) => ({
        fileUrl: uploadService.getFileUrl(file.path),
        fileName: file.originalname,
        fileSize: file.size,
        mimeType: file.mimetype,
      }));

      res.json({
        message: 'Файлы успешно загружены',
        files: uploadedFiles,
      });
    } catch (error) {
      console.error('Error uploading post files:', error);
      const message = error instanceof Error ? error.message : 'Ошибка при загрузке файлов';
      res.status(500).json({ message });
    }
  }
}

export const uploadController = new UploadController();
