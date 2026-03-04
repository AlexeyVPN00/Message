import 'reflect-metadata';
import { createServer } from 'http';
import app from './app';
import { initializeDatabase } from './config/database';
import { initializeRedis } from './config/redis';
import { initializeSocket } from './config/socket';
import { registerChatHandlers } from './sockets/chat.socket';
import * as dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Initialize database connection
    await initializeDatabase();

    // Initialize Redis connection
    await initializeRedis();

    // Create HTTP server
    const httpServer = createServer(app);

    // Initialize Socket.io
    const io = initializeSocket(httpServer);
    registerChatHandlers(io);

    // Start server
    httpServer.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
    });

    // Graceful shutdown
    const gracefulShutdown = async () => {
      console.log('\n🛑 Shutting down gracefully...');

      httpServer.close(() => {
        console.log('✅ HTTP server closed');
      });

      // Close database connection
      // await AppDataSource.destroy();

      process.exit(0);
    };

    process.on('SIGTERM', gracefulShutdown);
    process.on('SIGINT', gracefulShutdown);
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
