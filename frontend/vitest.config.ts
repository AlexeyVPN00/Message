import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],

  test: {
    // Test environment
    environment: 'jsdom',

    // Setup files
    setupFiles: ['./src/tests/setup.ts'],

    // Globals (allows using describe, it, expect without imports)
    globals: true,

    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'src/tests/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/mockData',
        'dist/',
        '**/*.interface.ts',
        '**/*.type.ts',
      ],
      all: true,
      lines: 60,
      functions: 60,
      branches: 50,
      statements: 60,
    },

    // Include/exclude patterns
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['node_modules', 'dist', '.idea', '.git', '.cache'],

    // Reporters
    reporters: ['verbose'],

    // Timeout
    testTimeout: 10000,
  },

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
