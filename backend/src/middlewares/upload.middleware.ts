import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Создаем директории для загрузок если их нет
const uploadDir = path.join(__dirname, '../../uploads');
const avatarsDir = path.join(uploadDir, 'avatars');
const messagesDir = path.join(uploadDir, 'messages');
const postsDir = path.join(uploadDir, 'posts');

[uploadDir, avatarsDir, messagesDir, postsDir].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Конфигурация хранилища Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadType = req.body.uploadType || 'avatars';
    let destDir = avatarsDir;

    switch (uploadType) {
      case 'message':
        destDir = messagesDir;
        break;
      case 'post':
        destDir = postsDir;
        break;
      default:
        destDir = avatarsDir;
    }

    cb(null, destDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

// Фильтр типов файлов
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedImageTypes = /jpeg|jpg|png|gif/;
  const allowedDocTypes = /pdf|doc|docx/;
  const allowedVideoTypes = /mp4|mov|avi/;

  const extname = path.extname(file.originalname).toLowerCase();
  const mimetype = file.mimetype;

  const isImage = allowedImageTypes.test(extname) && mimetype.startsWith('image/');
  const isDoc = allowedDocTypes.test(extname);
  const isVideo = allowedVideoTypes.test(extname) && mimetype.startsWith('video/');

  if (isImage || isDoc || isVideo) {
    cb(null, true);
  } else {
    cb(new Error('Неподдерживаемый тип файла. Разрешены: изображения (jpg, png, gif), документы (pdf, doc, docx), видео (mp4, mov, avi)'));
  }
};

// Multer конфигурация
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB максимум
  },
});

// Middleware для загрузки аватара
export const uploadAvatar = upload.single('avatar');

// Middleware для загрузки файлов к сообщениям
export const uploadMessageFile = upload.single('file');

// Middleware для загрузки файлов к постам
export const uploadPostFile = upload.array('files', 5); // До 5 файлов
