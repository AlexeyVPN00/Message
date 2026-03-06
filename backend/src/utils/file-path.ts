import path from 'path';
import fs from 'fs';

/**
 * File path validation utilities to prevent path traversal attacks
 */

/**
 * Директория для загрузок (uploads)
 */
const UPLOADS_DIR = path.resolve(__dirname, '../../uploads');

/**
 * Валидировать путь к файлу и убедиться, что он находится в разрешенной директории
 * Предотвращает path traversal атаки (например, ../../../etc/passwd)
 *
 * @param filePath - Путь к файлу (может быть относительным или абсолютным)
 * @param allowedDir - Разрешенная директория (по умолчанию uploads)
 * @returns Безопасный абсолютный путь к файлу
 * @throws Error если путь выходит за пределы разрешенной директории
 *
 * @example
 * validateFilePath('/uploads/avatars/user.jpg') // OK
 * validateFilePath('avatars/user.jpg') // OK
 * validateFilePath('../../../etc/passwd') // THROWS ERROR
 * validateFilePath('/etc/passwd') // THROWS ERROR
 */
export function validateFilePath(
  filePath: string,
  allowedDir: string = UPLOADS_DIR
): string {
  // Нормализуем разрешенную директорию
  const normalizedAllowedDir = path.resolve(allowedDir);

  // Удаляем префикс /uploads/ если он есть (для URL-like paths)
  let cleanPath = filePath;
  if (cleanPath.startsWith('/uploads/')) {
    cleanPath = cleanPath.replace('/uploads/', '');
  } else if (cleanPath.startsWith('uploads/')) {
    cleanPath = cleanPath.replace('uploads/', '');
  }

  // Декодируем URL-encoded символы (для Cyrillic filenames)
  try {
    cleanPath = decodeURIComponent(cleanPath);
  } catch (error) {
    // Если не удалось декодировать, используем как есть
  }

  // Резолвим путь относительно разрешенной директории
  const resolvedPath = path.resolve(normalizedAllowedDir, cleanPath);

  // Проверяем, что результирующий путь находится внутри разрешенной директории
  // Используем path.relative для проверки - если результат начинается с '..', значит путь выходит за пределы
  const relativePath = path.relative(normalizedAllowedDir, resolvedPath);

  if (relativePath.startsWith('..') || path.isAbsolute(relativePath)) {
    throw new Error(
      `Path traversal detected: File path is outside allowed directory. Path: ${filePath}`
    );
  }

  return resolvedPath;
}

/**
 * Проверить, существует ли файл и находится ли он в разрешенной директории
 *
 * @param filePath - Путь к файлу
 * @param allowedDir - Разрешенная директория
 * @returns true если файл существует и находится в разрешенной директории
 */
export function isFileInAllowedDirectory(
  filePath: string,
  allowedDir: string = UPLOADS_DIR
): boolean {
  try {
    const validatedPath = validateFilePath(filePath, allowedDir);
    return fs.existsSync(validatedPath);
  } catch (error) {
    return false;
  }
}

/**
 * Безопасно удалить файл, проверяя, что он находится в разрешенной директории
 *
 * @param filePath - Путь к файлу для удаления
 * @param allowedDir - Разрешенная директория
 * @throws Error если путь выходит за пределы разрешенной директории
 */
export function safeDeleteFile(
  filePath: string,
  allowedDir: string = UPLOADS_DIR
): void {
  // Валидируем путь (выбросит ошибку если путь небезопасный)
  const validatedPath = validateFilePath(filePath, allowedDir);

  // Проверяем существование файла
  if (!fs.existsSync(validatedPath)) {
    console.warn(`File does not exist: ${validatedPath}`);
    return;
  }

  // Проверяем, что это файл, а не директория
  const stats = fs.statSync(validatedPath);
  if (!stats.isFile()) {
    throw new Error(`Cannot delete: ${validatedPath} is not a file`);
  }

  // Безопасно удаляем файл
  fs.unlinkSync(validatedPath);
}

/**
 * Получить абсолютный путь к uploads директории
 */
export function getUploadsDir(): string {
  return UPLOADS_DIR;
}

/**
 * Получить относительный путь внутри uploads директории
 *
 * @param filePath - Абсолютный путь к файлу
 * @returns Относительный путь от uploads директории
 */
export function getRelativeUploadPath(filePath: string): string {
  const validatedPath = validateFilePath(filePath);
  return path.relative(UPLOADS_DIR, validatedPath);
}
