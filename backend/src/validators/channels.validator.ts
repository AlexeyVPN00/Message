import { z } from 'zod';

/**
 * Валидация данных каналов
 */

// Схема для имени канала
const channelNameSchema = z
  .string()
  .min(3, 'Название канала должно содержать минимум 3 символа')
  .max(100, 'Название канала не может превышать 100 символов');

// Схема для описания канала
const channelDescriptionSchema = z
  .string()
  .max(1000, 'Описание канала не может превышать 1000 символов')
  .optional();

// Схема для получения списка каналов
export const getChannelsSchema = z.object({
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

// Схема для создания канала
export const createChannelSchema = z.object({
  body: z.object({
    name: channelNameSchema,
    description: channelDescriptionSchema,
    isPrivate: z.boolean().optional(),
    avatar: z.string().url('Некорректный URL аватара').optional(),
  }),
});

// Схема для получения канала по ID
export const getChannelByIdSchema = z.object({
  params: z.object({
    id: z.string().uuid('Некорректный ID канала'),
  }),
});

// Схема для обновления канала
export const updateChannelSchema = z.object({
  params: z.object({
    id: z.string().uuid('Некорректный ID канала'),
  }),
  body: z.object({
    name: channelNameSchema.optional(),
    description: channelDescriptionSchema,
    isPrivate: z.boolean().optional(),
    avatar: z.string().url('Некорректный URL аватара').optional(),
  }),
});

// Схема для удаления канала
export const deleteChannelSchema = z.object({
  params: z.object({
    id: z.string().uuid('Некорректный ID канала'),
  }),
});

// Схема для подписки/отписки
export const subscribeSchema = z.object({
  params: z.object({
    id: z.string().uuid('Некорректный ID канала'),
  }),
});

// Схема для получения подписчиков
export const getSubscribersSchema = z.object({
  params: z.object({
    id: z.string().uuid('Некорректный ID канала'),
  }),
  query: z.object({
    limit: z
      .string()
      .regex(/^\d+$/, 'Limit должен быть числом')
      .transform(Number)
      .refine((val) => val > 0 && val <= 100, 'Limit должен быть от 1 до 100')
      .optional(),
  }),
});

// Схема для получения постов канала
export const getChannelPostsSchema = z.object({
  params: z.object({
    id: z.string().uuid('Некорректный ID канала'),
  }),
  query: z.object({
    limit: z
      .string()
      .regex(/^\d+$/, 'Limit должен быть числом')
      .transform(Number)
      .refine((val) => val > 0 && val <= 50, 'Limit должен быть от 1 до 50')
      .optional(),
    before: z.string().uuid('Некорректный ID поста').optional(),
  }),
});

// Схема для создания поста в канале
export const createChannelPostSchema = z.object({
  params: z.object({
    id: z.string().uuid('Некорректный ID канала'),
  }),
  body: z.object({
    content: z
      .string()
      .min(1, 'Содержимое поста не может быть пустым')
      .max(5000, 'Содержимое поста не может превышать 5000 символов'),
  }),
});

// Схема для удаления поста канала
export const deleteChannelPostSchema = z.object({
  params: z.object({
    postId: z.string().uuid('Некорректный ID поста'),
  }),
});

// Схема для увеличения просмотров поста
export const incrementPostViewsSchema = z.object({
  params: z.object({
    postId: z.string().uuid('Некорректный ID поста'),
  }),
});
