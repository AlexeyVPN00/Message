import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true,
  },
  build: {
    outDir: 'dist',
    minify: 'esbuild', // Enable minification with esbuild (faster than terser)
    sourcemap: false,
    // Code splitting for better caching and performance
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunk for React and related libraries
          vendor: ['react', 'react-dom', 'react-router-dom'],
          // UI libraries
          ui: ['@mui/material', '@mui/icons-material', '@emotion/react', '@emotion/styled'],
          // State management and utilities
          store: ['zustand', 'axios'],
          // Socket.io
          socket: ['socket.io-client'],
        },
      },
    },
    // Chunk size warning limit (500kb)
    chunkSizeWarningLimit: 500,
  },
  define: {
    'process.env.VITE_API_URL': JSON.stringify(process.env.VITE_API_URL || '/api'),
  },
});
