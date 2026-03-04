import { apiClient } from './axios.config';
import { User, UpdateUserDto, SearchUsersResponse } from '../types/user.types';

export const usersApi = {
  /**
   * Поиск пользователей
   */
  searchUsers: async (params: {
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<SearchUsersResponse> => {
    const response = await apiClient.get<SearchUsersResponse>('/users', { params });
    return response.data;
  },

  /**
   * Получить пользователя по ID
   */
  getUserById: async (userId: string): Promise<User> => {
    const response = await apiClient.get<User>(`/users/${userId}`);
    return response.data;
  },

  /**
   * Обновить профиль
   */
  updateUser: async (userId: string, data: UpdateUserDto): Promise<User> => {
    const response = await apiClient.put<User>(`/users/${userId}`, data);
    return response.data;
  },

  /**
   * Удалить аватар
   */
  deleteAvatar: async (userId: string): Promise<User> => {
    const response = await apiClient.delete<User>(`/users/${userId}/avatar`);
    return response.data;
  },
};
