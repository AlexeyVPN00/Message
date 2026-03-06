import { z } from 'zod';

/**
 * Валидация данных пользователей
 */

// Схема для username
const usernameSchema = z
  .string()
  .min(3, 'Имя пользователя должно содержать минимум 3 символа')
  .max(30, 'Имя пользователя не может превышать 30 символов')
  .regex(
    /^[a-zA-Z0-9_-]+$/,
    'Имя пользователя может содержать только буквы, цифры, дефис и подчеркивание'
  );

// Схема для bio
const bioSchema = z
  .string()
  .max(500, 'Описание профиля не может превышать 500 символов')
  .optional();

// Схема для поиска пользователей
export const searchUsersSchema = z.object({
  query: z.object({
    q: z.string().min(1, 'Поисковый запрос не может быть пустым').optional(),
    limit: z
      .string()
      .regex(/^\d+$/, 'Limit должен быть числом')
      .transform(Number)
      .refine((val) => val > 0 && val <= 50, 'Limit должен быть от 1 до 50')
      .optional(),
  }),
});

// Схема для получения пользователя по ID
export const getUserByIdSchema = z.object({
  params: z.object({
    id: z.string().uuid('Некорректный ID пользователя'),
  }),
});

// Схема для обновления профиля пользователя
export const updateUserSchema = z.object({
  params: z.object({
    id: z.string().uuid('Некорректный ID пользователя'),
  }),
  body: z.object({
    username: usernameSchema.optional(),
    bio: bioSchema,
    avatar: z.string().url('Некорректный URL аватара').optional(),
  }),
});

// Схема для удаления аватара
export const deleteAvatarSchema = z.object({
  params: z.object({
    id: z.string().uuid('Некорректный ID пользователя'),
  }),
});
