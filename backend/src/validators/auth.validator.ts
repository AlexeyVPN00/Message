import { z } from 'zod';

/**
 * Validation schemas for authentication endpoints
 */

// Password validation rules
const passwordSchema = z
  .string()
  .min(8, 'Пароль должен содержать минимум 8 символов')
  .max(128, 'Пароль слишком длинный')
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    'Пароль должен содержать заглавные и строчные буквы, а также цифры'
  );

// Email validation
const emailSchema = z
  .string()
  .email('Некорректный формат email')
  .max(255, 'Email слишком длинный')
  .toLowerCase()
  .trim();

// Username validation
const usernameSchema = z
  .string()
  .min(3, 'Имя пользователя должно содержать минимум 3 символа')
  .max(30, 'Имя пользователя должно содержать максимум 30 символов')
  .regex(
    /^[a-zA-Z0-9_]+$/,
    'Имя пользователя может содержать только буквы, цифры и подчеркивание'
  )
  .trim();

/**
 * POST /api/auth/register
 * Validates user registration data
 */
export const registerSchema = z.object({
  body: z.object({
    email: emailSchema,
    username: usernameSchema,
    password: passwordSchema,
    firstName: z
      .string()
      .min(1, 'Имя не может быть пустым')
      .max(50, 'Имя слишком длинное')
      .trim()
      .optional(),
    lastName: z
      .string()
      .min(1, 'Фамилия не может быть пустой')
      .max(50, 'Фамилия слишком длинная')
      .trim()
      .optional(),
  }),
});

/**
 * POST /api/auth/login
 * Validates user login credentials
 */
export const loginSchema = z.object({
  body: z.object({
    email: emailSchema,
    password: z.string().min(1, 'Пароль обязателен'),
  }),
});

/**
 * POST /api/auth/refresh
 * Validates refresh token
 */
export const refreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z
      .string()
      .min(1, 'Refresh token обязателен')
      .max(1000, 'Некорректный refresh token'),
  }),
});

/**
 * POST /api/auth/change-password
 * Validates password change request
 */
export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1, 'Текущий пароль обязателен'),
    newPassword: passwordSchema,
  }),
});

// Type exports for TypeScript
export type RegisterInput = z.infer<typeof registerSchema>['body'];
export type LoginInput = z.infer<typeof loginSchema>['body'];
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>['body'];
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>['body'];
