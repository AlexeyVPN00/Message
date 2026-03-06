import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { authLimiter } from '../config/rate-limit';
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
} from '../validators/auth.validator';

const router = Router();

// Public routes with validation and rate limiting (защита от brute force)
router.post('/register', authLimiter, validate(registerSchema), authController.register.bind(authController));
router.post('/login', authLimiter, validate(loginSchema), authController.login.bind(authController));
router.post('/refresh', validate(refreshTokenSchema), authController.refresh.bind(authController));

// Protected routes
router.post('/logout', authenticate, authController.logout.bind(authController));
router.get('/me', authenticate, authController.getCurrentUser.bind(authController));

export default router;
