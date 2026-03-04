import { create } from 'zustand';
import { Socket } from 'socket.io-client';
import { chatsApi } from '../api/chats.api';
import { Chat, Message, TypingUser } from '../types/chat.types';
import toast from 'react-hot-toast';

interface ChatState {
  chats: Chat[];
  currentChatId: string | null;
  messages: Record<string, Message[]>; // chatId -> messages
  typingUsers: Record<string, TypingUser[]>; // chatId -> typing users
  isLoading: boolean;
  socket: Socket | null;

  // Actions
  setSocket: (socket: Socket | null) => void;
  loadChats: () => Promise<void>;
  loadMessages: (chatId: string) => Promise<void>;
  setCurrentChat: (chatId: string | null) => void;
  createPrivateChat: (participantId: string) => Promise<Chat | null>;
  createGroupChat: (name: string, description: string | undefined, memberIds: string[]) => Promise<Chat | null>;
  updateGroupChat: (chatId: string, data: { name?: string; description?: string; avatarUrl?: string }) => Promise<void>;
  sendMessage: (chatId: string, content: string, replyToMessageId?: string) => void;
  handleNewMessage: (message: Message) => void;
  handleMessageUpdated: (message: Message) => void;
  handleMessageDeleted: (messageId: string) => void;
  handleTyping: (chatId: string, userId: string, username: string) => void;
  handleStopTyping: (chatId: string, userId: string) => void;
  emitTyping: (chatId: string) => void;
  emitStopTyping: (chatId: string) => void;
  joinChat: (chatId: string) => void;
  leaveChat: (chatId: string) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  chats: [],
  currentChatId: null,
  messages: {},
  typingUsers: {},
  isLoading: false,
  socket: null,

  setSocket: (socket) => {
    set({ socket });

    if (!socket) return;

    // Подписываемся на события WebSocket
    socket.on('message:new', (message: Message) => {
      get().handleNewMessage(message);
    });

    socket.on('message:updated', (message: Message) => {
      get().handleMessageUpdated(message);
    });

    socket.on('message:deleted', ({ messageId }: { messageId: string }) => {
      get().handleMessageDeleted(messageId);
    });

    socket.on('chat:typing', ({ chatId, userId }: { chatId: string; userId: string }) => {
      // Получаем username из чата
      const chat = get().chats.find((c) => c.id === chatId);
      const member = chat?.members.find((m) => m.userId === userId);
      if (member) {
        get().handleTyping(chatId, userId, member.user.username);
      }
    });

    socket.on('chat:stop_typing', ({ chatId, userId }: { chatId: string; userId: string }) => {
      get().handleStopTyping(chatId, userId);
    });
  },

  loadChats: async () => {
    try {
      set({ isLoading: true });
      const chats = await chatsApi.getUserChats();
      set({ chats, isLoading: false });
    } catch (error) {
      console.error('Error loading chats:', error);
      toast.error('Ошибка при загрузке чатов');
      set({ isLoading: false });
    }
  },

  loadMessages: async (chatId: string) => {
    try {
      set({ isLoading: true });
      const messages = await chatsApi.getMessages({ chatId, limit: 50 });

      set((state) => ({
        messages: {
          ...state.messages,
          [chatId]: messages,
        },
        isLoading: false,
      }));
    } catch (error) {
      console.error('Error loading messages:', error);
      toast.error('Ошибка при загрузке сообщений');
      set({ isLoading: false });
    }
  },

  setCurrentChat: (chatId) => {
    const { currentChatId, leaveChat, joinChat } = get();

    // Покидаем предыдущий чат
    if (currentChatId) {
      leaveChat(currentChatId);
    }

    set({ currentChatId: chatId });

    // Присоединяемся к новому чату
    if (chatId) {
      joinChat(chatId);
    }
  },

  createPrivateChat: async (participantId: string) => {
    try {
      const chat = await chatsApi.createPrivateChat({ participantId });

      set((state) => {
        const existingChat = state.chats.find((c) => c.id === chat.id);
        if (existingChat) {
          return state;
        }
        return { chats: [chat, ...state.chats] };
      });

      return chat;
    } catch (error) {
      console.error('Error creating chat:', error);
      toast.error('Ошибка при создании чата');
      return null;
    }
  },

  createGroupChat: async (name: string, description: string | undefined, memberIds: string[]) => {
    try {
      const chat = await chatsApi.createGroupChat({ name, description, memberIds });

      set((state) => ({
        chats: [chat, ...state.chats],
      }));

      toast.success('Группа успешно создана');
      return chat;
    } catch (error) {
      console.error('Error creating group chat:', error);
      toast.error('Ошибка при создании группы');
      return null;
    }
  },

  updateGroupChat: async (chatId: string, data: { name?: string; description?: string; avatarUrl?: string }) => {
    try {
      const updatedChat = await chatsApi.updateGroupChat(chatId, data);

      set((state) => ({
        chats: state.chats.map((chat) =>
          chat.id === chatId ? updatedChat : chat
        ),
      }));

      toast.success('Настройки группы обновлены');
    } catch (error) {
      console.error('Error updating group chat:', error);
      toast.error('Ошибка при обновлении группы');
      throw error;
    }
  },

  sendMessage: (chatId, content, replyToMessageId) => {
    const { socket } = get();

    if (!socket) {
      toast.error('Нет подключения к серверу');
      return;
    }

    socket.emit('message:send', {
      chatId,
      content,
      replyToMessageId,
    });
  },

  handleNewMessage: (message) => {
    set((state) => {
      const chatMessages = state.messages[message.chatId] || [];

      // Проверяем, нет ли уже этого сообщения
      if (chatMessages.some((m) => m.id === message.id)) {
        return state;
      }

      return {
        messages: {
          ...state.messages,
          [message.chatId]: [...chatMessages, message],
        },
        chats: state.chats.map((chat) =>
          chat.id === message.chatId
            ? { ...chat, lastMessage: message, updatedAt: message.createdAt }
            : chat
        ),
      };
    });
  },

  handleMessageUpdated: (message) => {
    set((state) => {
      const chatMessages = state.messages[message.chatId] || [];

      return {
        messages: {
          ...state.messages,
          [message.chatId]: chatMessages.map((m) =>
            m.id === message.id ? message : m
          ),
        },
      };
    });
  },

  handleMessageDeleted: (messageId) => {
    set((state) => {
      const newMessages = { ...state.messages };

      Object.keys(newMessages).forEach((chatId) => {
        newMessages[chatId] = newMessages[chatId].map((m) =>
          m.id === messageId
            ? { ...m, isDeleted: true, content: 'Сообщение удалено' }
            : m
        );
      });

      return { messages: newMessages };
    });
  },

  handleTyping: (chatId, userId, username) => {
    set((state) => {
      const typingInChat = state.typingUsers[chatId] || [];

      // Проверяем, нет ли уже этого пользователя
      if (typingInChat.some((u) => u.userId === userId)) {
        return state;
      }

      return {
        typingUsers: {
          ...state.typingUsers,
          [chatId]: [...typingInChat, { userId, username }],
        },
      };
    });

    // Автоматически убираем индикатор через 3 секунды
    setTimeout(() => {
      get().handleStopTyping(chatId, userId);
    }, 3000);
  },

  handleStopTyping: (chatId, userId) => {
    set((state) => {
      const typingInChat = state.typingUsers[chatId] || [];

      return {
        typingUsers: {
          ...state.typingUsers,
          [chatId]: typingInChat.filter((u) => u.userId !== userId),
        },
      };
    });
  },

  emitTyping: (chatId) => {
    const { socket } = get();
    if (socket) {
      socket.emit('chat:typing', { chatId });
    }
  },

  emitStopTyping: (chatId) => {
    const { socket } = get();
    if (socket) {
      socket.emit('chat:stop_typing', { chatId });
    }
  },

  joinChat: (chatId) => {
    const { socket } = get();
    if (socket) {
      socket.emit('chat:join', { chatId });
    }
  },

  leaveChat: (chatId) => {
    const { socket } = get();
    if (socket) {
      socket.emit('chat:leave', { chatId });
    }
  },
}));
