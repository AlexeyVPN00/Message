import { AuthService } from '../../services/auth.service';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { mockUser } from '../setup';

// Mock dependencies
jest.mock('../../config/database', () => ({
  AppDataSource: {
    getRepository: jest.fn(() => ({
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    })),
  },
}));

jest.mock('bcrypt');
jest.mock('jsonwebtoken');

describe('AuthService', () => {
  let authService: AuthService;
  let mockUserRepository: any;

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();

    // Create mock repository
    mockUserRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    // Mock AppDataSource.getRepository to return our mock
    const { AppDataSource } = require('../../config/database');
    AppDataSource.getRepository.mockReturnValue(mockUserRepository);

    authService = new AuthService();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const registerDto = {
        email: 'newuser@example.com',
        username: 'newuser',
        password: 'Password123',
      };

      // Mock: user doesn't exist
      mockUserRepository.findOne.mockResolvedValue(null);

      // Mock: bcrypt hashes password
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');

      // Mock: create and save user
      const newUser = { id: '123', ...registerDto, passwordHash: 'hashedPassword' };
      mockUserRepository.create.mockReturnValue(newUser);
      mockUserRepository.save.mockResolvedValue(newUser);

      // Mock: JWT tokens
      (jwt.sign as jest.Mock).mockReturnValueOnce('accessToken').mockReturnValueOnce('refreshToken');

      const result = await authService.register(registerDto);

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(mockUserRepository.findOne).toHaveBeenCalledTimes(2); // Check email and username
      expect(bcrypt.hash).toHaveBeenCalledWith('Password123', 10);
      expect(mockUserRepository.save).toHaveBeenCalled();
    });

    it('should throw error if email already exists', async () => {
      const registerDto = {
        email: 'existing@example.com',
        username: 'newuser',
        password: 'Password123',
      };

      // Mock: email already exists
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      await expect(authService.register(registerDto)).rejects.toThrow('Email уже используется');
      expect(mockUserRepository.save).not.toHaveBeenCalled();
    });

    it('should throw error if username already exists', async () => {
      const registerDto = {
        email: 'newuser@example.com',
        username: 'existinguser',
        password: 'Password123',
      };

      // Mock: email doesn't exist, but username does
      mockUserRepository.findOne
        .mockResolvedValueOnce(null) // email check
        .mockResolvedValueOnce(mockUser); // username check

      await expect(authService.register(registerDto)).rejects.toThrow('Имя пользователя уже занято');
      expect(mockUserRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('should login user with correct credentials', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'Password123',
      };

      // Mock: user exists
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      // Mock: password matches
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      // Mock: JWT tokens
      (jwt.sign as jest.Mock).mockReturnValueOnce('accessToken').mockReturnValueOnce('refreshToken');

      const result = await authService.login(loginDto);

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(bcrypt.compare).toHaveBeenCalledWith('Password123', mockUser.passwordHash);
    });

    it('should throw error with invalid email', async () => {
      const loginDto = {
        email: 'nonexistent@example.com',
        password: 'Password123',
      };

      // Mock: user not found
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(authService.login(loginDto)).rejects.toThrow('Неверный email или пароль');
      expect(bcrypt.compare).not.toHaveBeenCalled();
    });

    it('should throw error with invalid password', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'WrongPassword',
      };

      // Mock: user exists
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      // Mock: password doesn't match
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(authService.login(loginDto)).rejects.toThrow('Неверный email или пароль');
    });
  });

  describe('verifyToken', () => {
    it('should verify valid token', () => {
      const token = 'validToken';
      const decoded = { userId: mockUser.id };

      (jwt.verify as jest.Mock).mockReturnValue(decoded);

      const result = authService.verifyToken(token);

      expect(result).toEqual(decoded);
      expect(jwt.verify).toHaveBeenCalledWith(token, process.env.JWT_SECRET);
    });

    it('should throw error for invalid token', () => {
      const token = 'invalidToken';

      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid token');
      });

      expect(() => authService.verifyToken(token)).toThrow('Invalid token');
    });
  });
});
