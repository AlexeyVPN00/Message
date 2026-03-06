import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { verifyAccessToken } from '../utils/jwt';
import { usersService } from '../services/users.service';

export interface AuthenticatedSocket extends Socket {
  userId?: string;
}

let io: SocketIOServer | null = null;

export const initializeSocket = (httpServer: HTTPServer): SocketIOServer => {
  const allowedOrigins = [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    'http://eramessage.ru',
    'https://eramessage.ru',
  ];

  io = new SocketIOServer(httpServer, {
    cors: {
      origin: allowedOrigins,
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  // Middleware для аутентификации
  io.use((socket: AuthenticatedSocket, next) => {
    try {
      const token = socket.handshake.auth.token;

      if (!token) {
        return next(new Error('Токен не предоставлен'));
      }

      const payload = verifyAccessToken(token);
      socket.userId = payload.userId;

      next();
    } catch (error) {
      next(new Error('Недействительный токен'));
    }
  });

  io.on('connection', async (socket: AuthenticatedSocket) => {
    console.log(`✅ User connected: ${socket.userId}`);

    // Устанавливаем пользователя как онлайн
    if (socket.userId) {
      await usersService.updateOnlineStatus(socket.userId, true);

      // Уведомляем всех о том, что пользователь онлайн
      io?.emit('user:online', { userId: socket.userId });
    }

    // Обработка отключения
    socket.on('disconnect', async () => {
      console.log(`❌ User disconnected: ${socket.userId}`);

      if (socket.userId) {
        await usersService.updateOnlineStatus(socket.userId, false);

        // Уведомляем всех о том, что пользователь оффлайн
        io?.emit('user:offline', {
          userId: socket.userId,
          lastSeen: new Date(),
        });
      }
    });
  });

  console.log('✅ Socket.IO initialized');

  return io;
};

export const getIO = (): SocketIOServer => {
  if (!io) {
    throw new Error('Socket.IO не инициализирован');
  }
  return io;
};
