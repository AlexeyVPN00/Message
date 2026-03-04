import { apiClient } from './axios.config';
import {
  Channel,
  ChannelSubscriber,
  ChannelPost,
  CreateChannelDto,
  UpdateChannelDto,
  CreateChannelPostDto,
} from '../types/channel.types';

export const channelsApi = {
  /**
   * Получить список каналов
   */
  getChannels: async (includePrivate: boolean = false): Promise<Channel[]> => {
    const response = await apiClient.get<Channel[]>('/channels', {
      params: { includePrivate },
    });
    return response.data;
  },

  /**
   * Получить канал по ID
   */
  getChannelById: async (channelId: string): Promise<Channel> => {
    const response = await apiClient.get<Channel>(`/channels/${channelId}`);
    return response.data;
  },

  /**
   * Создать канал
   */
  createChannel: async (data: CreateChannelDto): Promise<Channel> => {
    const response = await apiClient.post<Channel>('/channels', data);
    return response.data;
  },

  /**
   * Обновить канал
   */
  updateChannel: async (channelId: string, data: UpdateChannelDto): Promise<Channel> => {
    const response = await apiClient.put<Channel>(`/channels/${channelId}`, data);
    return response.data;
  },

  /**
   * Удалить канал
   */
  deleteChannel: async (channelId: string): Promise<void> => {
    await apiClient.delete(`/channels/${channelId}`);
  },

  /**
   * Подписаться на канал
   */
  subscribe: async (channelId: string): Promise<ChannelSubscriber> => {
    const response = await apiClient.post<ChannelSubscriber>(`/channels/${channelId}/subscribe`);
    return response.data;
  },

  /**
   * Отписаться от канала
   */
  unsubscribe: async (channelId: string): Promise<void> => {
    await apiClient.delete(`/channels/${channelId}/subscribe`);
  },

  /**
   * Получить подписчиков канала
   */
  getSubscribers: async (channelId: string): Promise<ChannelSubscriber[]> => {
    const response = await apiClient.get<ChannelSubscriber[]>(`/channels/${channelId}/subscribers`);
    return response.data;
  },

  /**
   * Получить посты канала
   */
  getChannelPosts: async (channelId: string, limit?: number, before?: string): Promise<ChannelPost[]> => {
    const response = await apiClient.get<ChannelPost[]>(`/channels/${channelId}/posts`, {
      params: { limit, before },
    });
    return response.data;
  },

  /**
   * Создать пост в канале
   */
  createPost: async (channelId: string, data: CreateChannelPostDto): Promise<ChannelPost> => {
    const response = await apiClient.post<ChannelPost>(`/channels/${channelId}/posts`, data);
    return response.data;
  },

  /**
   * Удалить пост
   */
  deletePost: async (postId: string): Promise<void> => {
    await apiClient.delete(`/channels/posts/${postId}`);
  },

  /**
   * Увеличить счетчик просмотров поста
   */
  incrementPostViews: async (postId: string): Promise<void> => {
    await apiClient.post(`/channels/posts/${postId}/view`);
  },

  /**
   * Получить подписки пользователя
   */
  getUserSubscriptions: async (): Promise<Channel[]> => {
    const response = await apiClient.get<Channel[]>('/channels/subscriptions');
    return response.data;
  },
};
