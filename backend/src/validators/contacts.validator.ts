import { z } from 'zod';

/**
 * Валидация данных контактов
 */

// Схема для получения контактов
export const getUserContactsSchema = z.object({
  query: z.object({
    q: z.string().min(1, 'Поисковый запрос не может быть пустым').optional(),
  }),
});

// Схема для добавления контакта
export const addContactSchema = z.object({
  body: z.object({
    contactId: z.string().uuid('Некорректный ID контакта'),
  }),
});

// Схема для удаления контакта
export const removeContactSchema = z.object({
  params: z.object({
    contactId: z.string().uuid('Некорректный ID контакта'),
  }),
});

// Схема для проверки контакта
export const checkContactSchema = z.object({
  params: z.object({
    contactId: z.string().uuid('Некорректный ID контакта'),
  }),
});
