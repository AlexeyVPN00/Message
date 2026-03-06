/**
 * Vitest test setup file
 * Runs before each test suite
 */

import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

// Extend Vitest's expect with jest-dom matchers
expect.extend(matchers);

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock window.matchMedia (required for MUI components)
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock IntersectionObserver (used for infinite scroll)
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords() {
    return [];
  }
  unobserve() {}
} as any;

// Mock socket.io-client
vi.mock('socket.io-client', () => ({
  io: vi.fn(() => ({
    on: vi.fn(),
    off: vi.fn(),
    emit: vi.fn(),
    disconnect: vi.fn(),
    connect: vi.fn(),
    removeAllListeners: vi.fn(),
  })),
}));

// Set test environment variables
process.env.VITE_API_URL = 'http://localhost:3001';
process.env.VITE_WS_URL = 'http://localhost:3001';

// Mock data for tests
export const mockUser = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  email: 'test@example.com',
  username: 'testuser',
  avatarUrl: null,
  bio: null,
  isOnline: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export const mockPost = {
  id: '223e4567-e89b-12d3-a456-426614174000',
  authorId: mockUser.id,
  content: 'Test post content',
  likesCount: 5,
  commentsCount: 2,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  author: mockUser,
  likes: [],
};

export const mockMessage = {
  id: '323e4567-e89b-12d3-a456-426614174000',
  chatId: '423e4567-e89b-12d3-a456-426614174000',
  senderId: mockUser.id,
  content: 'Test message',
  isEdited: false,
  isDeleted: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  sender: mockUser,
  attachments: [],
};

export const mockChat = {
  id: '423e4567-e89b-12d3-a456-426614174000',
  type: 'private' as const,
  createdBy: mockUser.id,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  members: [
    {
      id: '1',
      chatId: '423e4567-e89b-12d3-a456-426614174000',
      userId: mockUser.id,
      user: mockUser,
      role: 'member' as const,
      joinedAt: new Date().toISOString(),
    },
  ],
};
