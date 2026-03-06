/**
 * Jest test setup file
 * Runs before each test suite
 */

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-only';
process.env.DB_HOST = 'localhost';
process.env.DB_PORT = '5432';
process.env.DB_NAME = 'messenger_test';
process.env.DB_USER = 'postgres';
process.env.DB_PASSWORD = 'test';
process.env.REDIS_HOST = 'localhost';
process.env.REDIS_PORT = '6379';

// Increase timeout for database operations
jest.setTimeout(10000);

// Mock console methods to reduce noise in test output
global.console = {
  ...console,
  log: jest.fn(), // Mock console.log
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  // Keep error for debugging failing tests
  error: console.error,
};

// Global test utilities
export const mockUser = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  email: 'test@example.com',
  username: 'testuser',
  passwordHash: '$2b$10$dummyhashedpassword',
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const mockUser2 = {
  id: '123e4567-e89b-12d3-a456-426614174001',
  email: 'test2@example.com',
  username: 'testuser2',
  passwordHash: '$2b$10$dummyhashedpassword',
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const mockPost = {
  id: '223e4567-e89b-12d3-a456-426614174000',
  authorId: mockUser.id,
  content: 'Test post content',
  likesCount: 0,
  commentsCount: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const mockChat = {
  id: '323e4567-e89b-12d3-a456-426614174000',
  type: 'private',
  createdBy: mockUser.id,
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const mockMessage = {
  id: '423e4567-e89b-12d3-a456-426614174000',
  chatId: mockChat.id,
  senderId: mockUser.id,
  content: 'Test message',
  isEdited: false,
  isDeleted: false,
  createdAt: new Date(),
  updatedAt: new Date(),
};

// Cleanup function to run after all tests
afterAll(async () => {
  // Close database connections, cleanup resources, etc.
  // This will be implemented when we set up the actual database connection
});
