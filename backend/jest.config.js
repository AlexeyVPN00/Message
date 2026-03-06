/** @type {import('jest').Config} */
module.exports = {
  // Use ts-jest preset for TypeScript support
  preset: 'ts-jest',

  // Test environment
  testEnvironment: 'node',

  // Root directory for tests
  roots: ['<rootDir>/src'],

  // Test file patterns
  testMatch: [
    '**/__tests__/**/*.+(ts|tsx|js)',
    '**/?(*.)+(spec|test).+(ts|tsx|js)',
  ],

  // Transform files with ts-jest
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },

  // Module file extensions
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],

  // Coverage configuration
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.interface.ts',
    '!src/**/*.type.ts',
    '!src/index.ts',
    '!src/app.ts',
    '!src/config/**',
    '!src/models/**', // Entities don't need tests
  ],

  coverageDirectory: 'coverage',

  coverageThresholds: {
    global: {
      branches: 50,
      functions: 50,
      lines: 60,
      statements: 60,
    },
  },

  // Setup files
  setupFilesAfterEnv: ['<rootDir>/src/tests/setup.ts'],

  // Clear mocks between tests
  clearMocks: true,

  // Verbose output
  verbose: true,

  // Timeout for tests (10 seconds)
  testTimeout: 10000,

  // Ignore patterns
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],

  // Module name mapper for path aliases (if you use them)
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
};
