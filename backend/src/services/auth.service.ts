import { AppDataSource } from '../config/database';
import { redisClient } from '../config/redis';
import { User } from '../models/User.entity';
import { RegisterDto, LoginDto, AuthResponse, RefreshResponse } from '../types/auth.types';
import { hashPassword, comparePasswords } from '../utils/bcrypt';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt';

export class AuthService {
  private userRepository = AppDataSource.getRepository(User);

  async register(data: RegisterDto): Promise<AuthResponse> {
    // Check if email already exists
    const existingEmail = await this.userRepository.findOne({
      where: { email: data.email },
    });

    if (existingEmail) {
      throw new Error('Пользователь с таким email уже существует');
    }

    // Check if username already exists
    const existingUsername = await this.userRepository.findOne({
      where: { username: data.username },
    });

    if (existingUsername) {
      throw new Error('Пользователь с таким username (@) уже существует');
    }

    // Check if phone already exists (if provided)
    if (data.phone) {
      const existingPhone = await this.userRepository.findOne({
        where: { phone: data.phone },
      });

      if (existingPhone) {
        throw new Error('Пользователь с таким номером телефона уже существует');
      }
    }

    // Hash password
    const passwordHash = await hashPassword(data.password);

    // Create user
    const user = this.userRepository.create({
      email: data.email,
      username: data.username,
      passwordHash,
      firstName: data.firstName || null,
      lastName: data.lastName || null,
      phone: data.phone || null,
    });

    await this.userRepository.save(user);

    // Generate tokens
    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
    });

    const refreshToken = generateRefreshToken({
      userId: user.id,
      email: user.email,
    });

    // Store refresh token in Redis (7 days TTL)
    await redisClient.setEx(
      `refresh_token:${user.id}`,
      7 * 24 * 60 * 60, // 7 days in seconds
      refreshToken
    );

    return {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        avatarUrl: user.avatarUrl,
      },
      accessToken,
    };
  }

  async login(data: LoginDto): Promise<AuthResponse> {
    // Find user by email
    const user = await this.userRepository.findOne({
      where: { email: data.email },
    });

    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Verify password
    const isPasswordValid = await comparePasswords(data.password, user.passwordHash);

    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    // Generate tokens
    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
    });

    const refreshToken = generateRefreshToken({
      userId: user.id,
      email: user.email,
    });

    // Store refresh token in Redis
    await redisClient.setEx(
      `refresh_token:${user.id}`,
      7 * 24 * 60 * 60,
      refreshToken
    );

    // Update last seen and online status
    user.isOnline = true;
    user.lastSeen = new Date();
    await this.userRepository.save(user);

    return {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        avatarUrl: user.avatarUrl,
      },
      accessToken,
    };
  }

  async refreshToken(refreshToken: string): Promise<RefreshResponse> {
    // Verify refresh token
    const payload = verifyRefreshToken(refreshToken);

    // Check if refresh token exists in Redis
    const storedToken = await redisClient.get(`refresh_token:${payload.userId}`);

    if (!storedToken || storedToken !== refreshToken) {
      throw new Error('Invalid refresh token');
    }

    // Generate new access token
    const newAccessToken = generateAccessToken({
      userId: payload.userId,
      email: payload.email,
    });

    return {
      accessToken: newAccessToken,
    };
  }

  async logout(userId: string): Promise<void> {
    // Remove refresh token from Redis
    await redisClient.del(`refresh_token:${userId}`);

    // Update user status
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (user) {
      user.isOnline = false;
      user.lastSeen = new Date();
      await this.userRepository.save(user);
    }
  }

  async getCurrentUser(userId: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { id: userId } });
  }
}

export const authService = new AuthService();
