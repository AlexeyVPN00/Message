import { apiClient } from './axios.config';
import { Chat, Message, CreateChatDto, SendMessageDto, ChatMember, MemberRole } from '../types/chat.types';

export interface CreateGroupChatDto {
  name: string;
  description?: string;
  memberIds: string[];
}

export interface UpdateGroupChatDto {
  name?: string;
  description?: string;
  avatarUrl?: string;
}

export const chatsApi = {
  /**
   * Получить список чатов пользователя
   */
  getUserChats: async (): Promise<Chat[]> => {
    const response = await apiClient.get<Chat[]>('/chats');
    return response.data;
  },

  /**
   * Создать или получить приватный чат
   */
  createPrivateChat: async (data: CreateChatDto): Promise<Chat> => {
    const response = await apiClient.post<Chat>('/chats', data);
    return response.data;
  },

  /**
   * Получить информацию о чате
   */
  getChatById: async (chatId: string): Promise<Chat> => {
    const response = await apiClient.get<Chat>(`/chats/${chatId}`);
    return response.data;
  },

  /**
   * Получить сообщения чата
   */
  getMessages: async (params: {
    chatId: string;
    limit?: number;
    before?: string;
    after?: string;
  }): Promise<Message[]> => {
    const { chatId, ...queryParams } = params;
    const response = await apiClient.get<Message[]>(`/chats/${chatId}/messages`, {
      params: queryParams,
    });
    return response.data;
  },

  /**
   * Отправить сообщение (через REST API, не WebSocket)
   */
  sendMessage: async (data: SendMessageDto): Promise<Message> => {
    const { chatId, ...body } = data;
    const response = await apiClient.post<Message>(`/chats/${chatId}/messages`, body);
    return response.data;
  },

  /**
   * Получить сообщение по ID
   */
  getMessageById: async (messageId: string): Promise<Message> => {
    const response = await apiClient.get<Message>(`/messages/${messageId}`);
    return response.data;
  },

  /**
   * Редактировать сообщение
   */
  updateMessage: async (messageId: string, content: string): Promise<Message> => {
    const response = await apiClient.put<Message>(`/messages/${messageId}`, { content });
    return response.data;
  },

  /**
   * Удалить сообщение
   */
  deleteMessage: async (messageId: string): Promise<void> => {
    await apiClient.delete(`/messages/${messageId}`);
  },

  /**
   * Отметить сообщение как прочитанное
   */
  markAsRead: async (messageId: string): Promise<void> => {
    await apiClient.post(`/messages/${messageId}/read`);
  },

  /**
   * Создать групповой чат
   */
  createGroupChat: async (data: CreateGroupChatDto): Promise<Chat> => {
    const response = await apiClient.post<Chat>('/chats/group', data);
    return response.data;
  },

  /**
   * Обновить групповой чат
   */
  updateGroupChat: async (chatId: string, data: UpdateGroupChatDto): Promise<Chat> => {
    const response = await apiClient.put<Chat>(`/chats/${chatId}`, data);
    return response.data;
  },

  /**
   * Получить участников чата
   */
  getChatMembers: async (chatId: string): Promise<ChatMember[]> => {
    const response = await apiClient.get<ChatMember[]>(`/chats/${chatId}/members`);
    return response.data;
  },

  /**
   * Добавить участника в группу
   */
  addMember: async (chatId: string, userId: string, role?: MemberRole): Promise<ChatMember> => {
    const response = await apiClient.post<ChatMember>(`/chats/${chatId}/members`, {
      userId,
      role,
    });
    return response.data;
  },

  /**
   * Удалить участника из группы
   */
  removeMember: async (chatId: string, userId: string): Promise<void> => {
    await apiClient.delete(`/chats/${chatId}/members/${userId}`);
  },

  /**
   * Изменить роль участника
   */
  updateMemberRole: async (chatId: string, userId: string, role: MemberRole): Promise<ChatMember> => {
    const response = await apiClient.patch<ChatMember>(`/chats/${chatId}/members/${userId}`, {
      role,
    });
    return response.data;
  },
};
