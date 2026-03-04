import { Request, Response } from 'express';
import { authService } from '../services/auth.service';
import { RegisterDto, LoginDto } from '../types/auth.types';

export class AuthController {
  async register(req: Request, res: Response) {
    try {
      const data: RegisterDto = req.body;

      // Basic validation
      if (!data.email || !data.username || !data.password) {
        return res.status(400).json({
          error: 'Validation Error',
          message: 'Email, username, and password are required',
        });
      }

      const result = await authService.register(data);

      // Set refresh token as HttpOnly cookie
      res.cookie('refreshToken', result.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      return res.status(201).json(result);
    } catch (error) {
      return res.status(400).json({
        error: 'Registration Failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const data: LoginDto = req.body;

      // Basic validation
      if (!data.email || !data.password) {
        return res.status(400).json({
          error: 'Validation Error',
          message: 'Email and password are required',
        });
      }

      const result = await authService.login(data);

      // Set refresh token as HttpOnly cookie
      res.cookie('refreshToken', result.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return res.status(200).json(result);
    } catch (error) {
      return res.status(401).json({
        error: 'Login Failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async refresh(req: Request, res: Response) {
    try {
      const refreshToken = req.cookies.refreshToken;

      if (!refreshToken) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'No refresh token provided',
        });
      }

      const result = await authService.refreshToken(refreshToken);

      return res.status(200).json(result);
    } catch (error) {
      return res.status(401).json({
        error: 'Token Refresh Failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async logout(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'User not authenticated',
        });
      }

      await authService.logout(userId);

      // Clear refresh token cookie
      res.clearCookie('refreshToken');

      return res.status(200).json({
        message: 'Logged out successfully',
      });
    } catch (error) {
      return res.status(500).json({
        error: 'Logout Failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async getCurrentUser(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'User not authenticated',
        });
      }

      const user = await authService.getCurrentUser(userId);

      if (!user) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'User not found',
        });
      }

      return res.status(200).json({
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        avatarUrl: user.avatarUrl,
        isOnline: user.isOnline,
        lastSeen: user.lastSeen,
      });
    } catch (error) {
      return res.status(500).json({
        error: 'Failed to get user',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}

export const authController = new AuthController();
