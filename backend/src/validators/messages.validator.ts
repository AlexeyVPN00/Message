import { z } from 'zod';

/**
 * Validation schemas for message endpoints
 */

// UUID validation
const uuidSchema = z.string().uuid('Некорректный формат ID');

// File attachment validation
const attachmentSchema = z.object({
  fileName: z
    .string()
    .min(1, 'Имя файла не может быть пустым')
    .max(255, 'Имя файла слишком длинное'),
  fileUrl: z.string().url('Некорректный URL файла').max(2048),
  fileSize: z
    .number()
    .int('Размер файла должен быть целым числом')
    .min(1, 'Размер файла должен быть больше 0')
    .max(10 * 1024 * 1024, 'Размер файла не может превышать 10MB'),
  mimeType: z
    .string()
    .min(1, 'Тип файла обязателен')
    .max(255, 'Тип файла слишком длинный')
    .regex(
      /^[a-z]+\/[a-z0-9\-\+\.]+$/i,
      'Некорректный формат MIME type'
    ),
});

/**
 * POST /api/chats/:chatId/messages
 * Create new message in chat
 */
export const createMessageSchema = z.object({
  body: z
    .object({
      content: z
        .string()
        .max(10000, 'Сообщение не может превышать 10000 символов')
        .optional(),
      replyToMessageId: uuidSchema.optional(),
      attachments: z
        .array(attachmentSchema)
        .max(10, 'Максимум 10 файлов на сообщение')
        .optional(),
    })
    .refine(
      (data) => data.content || (data.attachments && data.attachments.length > 0),
      {
        message: 'Сообщение должно содержать текст или вложения',
      }
    ),
  params: z.object({
    chatId: uuidSchema,
  }),
});

/**
 * PUT /api/messages/:messageId
 * Update existing message
 */
export const updateMessageSchema = z.object({
  body: z.object({
    content: z
      .string()
      .min(1, 'Сообщение не может быть пустым')
      .max(10000, 'Сообщение не может превышать 10000 символов'),
  }),
  params: z.object({
    messageId: uuidSchema,
  }),
});

/**
 * DELETE /api/messages/:messageId
 * Delete message
 */
export const deleteMessageSchema = z.object({
  params: z.object({
    messageId: uuidSchema,
  }),
});

/**
 * GET /api/chats/:chatId/messages
 * Get messages from chat with pagination
 */
export const getMessagesSchema = z.object({
  params: z.object({
    chatId: uuidSchema,
  }),
  query: z.object({
    limit: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val, 10) : 50))
      .pipe(z.number().int().min(1).max(100)),
    before: uuidSchema.optional(),
    after: uuidSchema.optional(),
  }),
});

/**
 * POST /api/messages/:messageId/read
 * Mark message as read
 */
export const markAsReadSchema = z.object({
  params: z.object({
    messageId: uuidSchema,
  }),
});

// Type exports
export type CreateMessageInput = z.infer<typeof createMessageSchema>['body'];
export type UpdateMessageInput = z.infer<typeof updateMessageSchema>['body'];
export type GetMessagesQuery = z.infer<typeof getMessagesSchema>['query'];
