import { apiClient } from './axios.config';
import { Notification } from '../types/notification.types';

export const notificationsApi = {
  getNotifications: async (unreadOnly = false, limit = 50): Promise<Notification[]> => {
    const response = await apiClient.get<Notification[]>('/notifications', {
      params: { unreadOnly, limit },
    });
    return response.data;
  },

  getUnreadCount: async (): Promise<number> => {
    const response = await apiClient.get<{ count: number }>('/notifications/unread-count');
    return response.data.count;
  },

  markAsRead: async (notificationId: string): Promise<Notification> => {
    const response = await apiClient.put<Notification>(`/notifications/${notificationId}/read`);
    return response.data;
  },

  markAllAsRead: async (): Promise<void> => {
    await apiClient.put('/notifications/read-all');
  },

  deleteNotification: async (notificationId: string): Promise<void> => {
    await apiClient.delete(`/notifications/${notificationId}`);
  },

  deleteAllRead: async (): Promise<void> => {
    await apiClient.delete('/notifications/read');
  },
};
