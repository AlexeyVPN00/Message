import { create } from 'zustand';
import { notificationsApi } from '../api/notifications.api';
import { Notification } from '../types/notification.types';
import toast from 'react-hot-toast';

interface NotificationsState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;

  // Actions
  loadNotifications: (unreadOnly?: boolean) => Promise<void>;
  loadUnreadCount: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  deleteAllRead: () => Promise<void>;

  // Real-time updates
  addNotification: (notification: Notification) => void;
  decrementUnreadCount: () => void;
}

export const useNotificationsStore = create<NotificationsState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,

  loadNotifications: async (unreadOnly = false) => {
    try {
      set({ isLoading: true });
      const notifications = await notificationsApi.getNotifications(unreadOnly);
      set({ notifications, isLoading: false });
    } catch (error) {
      console.error('Error loading notifications:', error);
      toast.error('Ошибка при загрузке уведомлений');
      set({ isLoading: false });
    }
  },

  loadUnreadCount: async () => {
    try {
      const count = await notificationsApi.getUnreadCount();
      set({ unreadCount: count });
    } catch (error) {
      console.error('Error loading unread count:', error);
    }
  },

  markAsRead: async (notificationId: string) => {
    try {
      await notificationsApi.markAsRead(notificationId);

      set((state) => ({
        notifications: state.notifications.map((n) =>
          n.id === notificationId ? { ...n, isRead: true } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      }));
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast.error('Ошибка при обновлении уведомления');
    }
  },

  markAllAsRead: async () => {
    try {
      await notificationsApi.markAllAsRead();

      set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
        unreadCount: 0,
      }));

      toast.success('Все уведомления отмечены как прочитанные');
    } catch (error) {
      console.error('Error marking all as read:', error);
      toast.error('Ошибка при обновлении уведомлений');
    }
  },

  deleteNotification: async (notificationId: string) => {
    try {
      const notification = get().notifications.find((n) => n.id === notificationId);

      await notificationsApi.deleteNotification(notificationId);

      set((state) => ({
        notifications: state.notifications.filter((n) => n.id !== notificationId),
        unreadCount: notification && !notification.isRead
          ? Math.max(0, state.unreadCount - 1)
          : state.unreadCount,
      }));

      toast.success('Уведомление удалено');
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error('Ошибка при удалении уведомления');
    }
  },

  deleteAllRead: async () => {
    try {
      await notificationsApi.deleteAllRead();

      set((state) => ({
        notifications: state.notifications.filter((n) => !n.isRead),
      }));

      toast.success('Прочитанные уведомления удалены');
    } catch (error) {
      console.error('Error deleting read notifications:', error);
      toast.error('Ошибка при удалении уведомлений');
    }
  },

  // Real-time updates from WebSocket
  addNotification: (notification: Notification) => {
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    }));
  },

  decrementUnreadCount: () => {
    set((state) => ({
      unreadCount: Math.max(0, state.unreadCount - 1),
    }));
  },
}));
