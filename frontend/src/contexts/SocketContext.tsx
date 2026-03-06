import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '../store/authStore';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
});

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within SocketProvider');
  }
  return context;
};

interface SocketProviderProps {
  children: React.ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { accessToken, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated || !accessToken) {
      // Если пользователь не авторизован, отключаем сокет
      if (socket) {
        socket.removeAllListeners(); // Удаляем все listeners
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    // ИСПРАВЛЕНИЕ УТЕЧКИ ПАМЯТИ: Отключаем старый socket перед созданием нового
    if (socket) {
      console.log('🔄 Disconnecting old socket before creating new one');
      socket.removeAllListeners(); // Удаляем все старые listeners
      socket.disconnect();
    }

    // Создаем подключение к Socket.io
    // Пустая строка означает использование текущего домена (relative path)
    const WS_URL = import.meta.env.VITE_WS_URL || '';

    const newSocket = io(WS_URL, {
      auth: {
        token: accessToken,
      },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    // Обработчики событий подключения
    newSocket.on('connect', () => {
      console.log('✅ Socket connected');
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('❌ Socket disconnected');
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setIsConnected(false);
    });

    newSocket.on('error', (error: { message: string }) => {
      console.error('Socket error:', error);
    });

    setSocket(newSocket);

    // ИСПРАВЛЕНИЕ УТЕЧКИ ПАМЯТИ: Cleanup при размонтировании
    return () => {
      console.log('🧹 Cleaning up socket');
      newSocket.removeAllListeners(); // Удаляем все listeners перед disconnect
      newSocket.disconnect();
    };
  }, [isAuthenticated, accessToken]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};
