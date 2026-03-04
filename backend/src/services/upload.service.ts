import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

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

      // Удаляем оригинал
      if (inputPath !== outputPath && fs.existsSync(inputPath)) {
        fs.unlinkSync(inputPath);
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
   * Удалить файл
   */
  async deleteFile(filePath: string): Promise<void> {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (error) {
      console.error('Error deleting file:', error);
      throw new Error('Ошибка при удалении файла');
    }
  }

  /**
   * Получить URL файла
   */
  getFileUrl(filePath: string): string {
    // В разработке возвращаем относительный путь
    const relativePath = filePath.replace(/\\/g, '/').split('/uploads/')[1];
    return `/uploads/${relativePath}`;
  }

  /**
   * Удалить старый аватар если есть
   */
  async deleteOldAvatar(avatarUrl?: string): Promise<void> {
    if (!avatarUrl) return;

    try {
      // Извлекаем путь к файлу из URL
      const filePath = path.join(__dirname, '../../uploads', avatarUrl.replace('/uploads/', ''));

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (error) {
      console.error('Error deleting old avatar:', error);
      // Не бросаем ошибку, чтобы не прерывать загрузку нового аватара
    }
  }
}

export const uploadService = new UploadService();
