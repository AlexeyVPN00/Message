import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
  build: {
    // Оптимизация production build
    rollupOptions: {
      output: {
        // Manual chunking для оптимального code splitting
        manualChunks: {
          // React и связанные библиотеки
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],

          // Material-UI - самая большая зависимость
          'vendor-mui': ['@mui/material', '@mui/icons-material'],

          // Утилиты и state management
          'vendor-utils': ['date-fns', 'axios', 'zustand', 'react-hot-toast'],

          // Socket.io
          'vendor-socket': ['socket.io-client'],
        },
      },
    },

    // Предупреждение о больших чанках (1MB вместо 500KB по умолчанию)
    chunkSizeWarningLimit: 1000,

    // Минификация
    minify: 'terser',
    terserOptions: {
      compress: {
        // Удаление console.log в production
        drop_console: true,
        drop_debugger: true,
      },
    },

    // Генерация source maps для production (для debugging)
    sourcemap: false, // Можно включить для staging: 'hidden'
  },

  // Оптимизация зависимостей
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@mui/material',
      '@mui/icons-material',
      'zustand',
      'axios',
      'socket.io-client',
    ],
  },
});
