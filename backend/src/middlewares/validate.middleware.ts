import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';

/**
 * Middleware for validating request data using Zod schemas
 *
 * @param schema - Zod schema object containing validation rules
 * @returns Express middleware function
 *
 * @example
 * router.post('/login', validate(loginSchema), authController.login);
 */
export const validate = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Validate request data against schema
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      // If validation passes, continue to next middleware
      next();
    } catch (error) {
      // Handle validation errors
      if (error instanceof ZodError) {
        const errors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code,
        }));

        res.status(400).json({
          error: 'Validation Error',
          message: 'Некорректные данные запроса',
          details: errors,
        });
        return;
      }

      // Handle unexpected errors
      console.error('Validation middleware error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Ошибка валидации данных',
      });
    }
  };
};
