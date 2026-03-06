import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { safeDeleteFile } from '../utils/file-path';

export interface ProcessImageOptions {
  width?: number;
  height?: number;
  quality?: number;
  fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
}

export class UploadService {
  /**
   * Обработать изображение (ресайз, оптимизация)
   */
  async processImage(
    inputPath: string,
    outputPath: string,
    options: ProcessImageOptions = {}
  ): Promise<string> {
    const { width = 400, height = 400, quality = 80, fit = 'cover' } = options;

    try {
      await sharp(inputPath)
        .resize(width, height, { fit })
        .jpeg({ quality })
        .toFile(outputPath);

      // Удаляем оригинал (с защитой от path traversal)
      if (inputPath !== outputPath) {
        try {
          safeDeleteFile(inputPath);
        } catch (error) {
          console.warn('Could not delete original file after processing:', error);
          // Не бросаем ошибку, т.к. обработанный файл уже создан
        }
      }

      return outputPath;
    } catch (error) {
      console.error('Error processing image:', error);
      throw new Error('Ошибка при обработке изображения');
    }
  }

  /**
   * Обработать аватар пользователя
   */
  async processAvatar(filePath: string): Promise<string> {
    const dir = path.dirname(filePath);
    const ext = path.extname(filePath);
    const filename = path.basename(filePath, ext);
    const processedPath = path.join(dir, `${filename}-processed.jpg`);

    await this.processImage(filePath, processedPath, {
      width: 400,
      height: 400,
      quality: 80,
      fit: 'cover',
    });

    return processedPath;
  }

  /**
   * Удалить файл (с защитой от path traversal)
   */
  async deleteFile(filePath: string): Promise<void> {
    try {
      // Используем безопасную функцию удаления с валидацией пути
      // Это предотвращает path traversal атаки (../../../etc/passwd)
      safeDeleteFile(filePath);
    } catch (error) {
      console.error('Error deleting file:', error);
      const errorMessage = error instanceof Error ? error.message : 'Ошибка при удалении файла';
      throw new Error(errorMessage);
    }
  }

  /**
   * Получить URL файла
   */
  getFileUrl(filePath: string): string {
    // Normalize path separators
    const relativePath = filePath.replace(/\\/g, '/').split('/uploads/')[1];

    // Split into directory and filename
    const parts = relativePath.split('/');
    const filename = parts.pop() || '';
    const directory = parts.join('/');

    // Encode filename for URL safety (handles Cyrillic)
    const encodedFilename = encodeURIComponent(filename);

    // Reconstruct path
    return directory
      ? `/uploads/${directory}/${encodedFilename}`
      : `/uploads/${encodedFilename}`;
  }

  /**
   * Удалить старый аватар если есть (с защитой от path traversal)
   */
  async deleteOldAvatar(avatarUrl?: string): Promise<void> {
    if (!avatarUrl) return;

    try {
      // Безопасное удаление с валидацией пути
      safeDeleteFile(avatarUrl);
    } catch (error) {
      console.error('Error deleting old avatar:', error);
      // Не бросаем ошибку, чтобы не прерывать загрузку нового аватара
    }
  }
}

export const uploadService = new UploadService();
