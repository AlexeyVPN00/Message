import { create } from 'zustand';
import { channelsApi } from '../api/channels.api';
import { Channel, ChannelPost } from '../types/channel.types';
import toast from 'react-hot-toast';

interface ChannelState {
  channels: Channel[];
  currentChannelId: string | null;
  posts: Record<string, ChannelPost[]>; // channelId -> posts
  isLoading: boolean;
  subscriptions: Channel[];

  // Actions
  loadChannels: () => Promise<void>;
  loadSubscriptions: () => Promise<void>;
  loadChannelPosts: (channelId: string) => Promise<void>;
  setCurrentChannel: (channelId: string | null) => void;
  createChannel: (name: string, description: string | undefined, isPrivate: boolean) => Promise<Channel | null>;
  updateChannel: (channelId: string, data: { name?: string; description?: string; avatarUrl?: string; isPrivate?: boolean }) => Promise<void>;
  deleteChannel: (channelId: string) => Promise<void>;
  subscribe: (channelId: string) => Promise<void>;
  unsubscribe: (channelId: string) => Promise<void>;
  createPost: (channelId: string, content: string) => Promise<void>;
  deletePost: (postId: string) => Promise<void>;
}

export const useChannelStore = create<ChannelState>((set, get) => ({
  channels: [],
  currentChannelId: null,
  posts: {},
  isLoading: false,
  subscriptions: [],

  loadChannels: async () => {
    try {
      set({ isLoading: true });
      const channels = await channelsApi.getChannels(false);
      set({ channels, isLoading: false });
    } catch (error) {
      console.error('Error loading channels:', error);
      toast.error('Ошибка при загрузке каналов');
      set({ isLoading: false });
    }
  },

  loadSubscriptions: async () => {
    try {
      const subscriptions = await channelsApi.getUserSubscriptions();
      set({ subscriptions });
    } catch (error) {
      console.error('Error loading subscriptions:', error);
      toast.error('Ошибка при загрузке подписок');
    }
  },

  loadChannelPosts: async (channelId: string) => {
    try {
      set({ isLoading: true });
      const posts = await channelsApi.getChannelPosts(channelId, 50);

      set((state) => ({
        posts: {
          ...state.posts,
          [channelId]: posts,
        },
        isLoading: false,
      }));
    } catch (error) {
      console.error('Error loading channel posts:', error);
      toast.error('Ошибка при загрузке постов');
      set({ isLoading: false });
    }
  },

  setCurrentChannel: (channelId) => {
    set({ currentChannelId: channelId });

    if (channelId) {
      get().loadChannelPosts(channelId);
    }
  },

  createChannel: async (name: string, description: string | undefined, isPrivate: boolean) => {
    try {
      const channel = await channelsApi.createChannel({ name, description, isPrivate });

      set((state) => ({
        channels: [channel, ...state.channels],
        subscriptions: [channel, ...state.subscriptions],
      }));

      toast.success('Канал успешно создан');
      return channel;
    } catch (error) {
      console.error('Error creating channel:', error);
      toast.error('Ошибка при создании канала');
      return null;
    }
  },

  updateChannel: async (channelId: string, data: { name?: string; description?: string; avatarUrl?: string; isPrivate?: boolean }) => {
    try {
      const updatedChannel = await channelsApi.updateChannel(channelId, data);

      set((state) => ({
        channels: state.channels.map((channel) =>
          channel.id === channelId ? updatedChannel : channel
        ),
        subscriptions: state.subscriptions.map((channel) =>
          channel.id === channelId ? updatedChannel : channel
        ),
      }));

      toast.success('Настройки канала обновлены');
    } catch (error) {
      console.error('Error updating channel:', error);
      toast.error('Ошибка при обновлении канала');
      throw error;
    }
  },

  deleteChannel: async (channelId: string) => {
    try {
      await channelsApi.deleteChannel(channelId);

      set((state) => ({
        channels: state.channels.filter((channel) => channel.id !== channelId),
        subscriptions: state.subscriptions.filter((channel) => channel.id !== channelId),
        currentChannelId: state.currentChannelId === channelId ? null : state.currentChannelId,
      }));

      toast.success('Канал удален');
    } catch (error) {
      console.error('Error deleting channel:', error);
      toast.error('Ошибка при удалении канала');
      throw error;
    }
  },

  subscribe: async (channelId: string) => {
    try {
      await channelsApi.subscribe(channelId);

      // Обновляем канал в списке
      set((state) => {
        const channel = state.channels.find((c) => c.id === channelId);
        if (channel) {
          const updatedChannel = {
            ...channel,
            isSubscribed: true,
            subscribersCount: channel.subscribersCount + 1,
          };

          return {
            channels: state.channels.map((c) =>
              c.id === channelId ? updatedChannel : c
            ),
            subscriptions: [updatedChannel, ...state.subscriptions],
          };
        }
        return state;
      });

      toast.success('Вы подписались на канал');
    } catch (error) {
      console.error('Error subscribing:', error);
      toast.error('Ошибка при подписке');
      throw error;
    }
  },

  unsubscribe: async (channelId: string) => {
    try {
      await channelsApi.unsubscribe(channelId);

      // Обновляем канал в списке
      set((state) => {
        const channel = state.channels.find((c) => c.id === channelId);
        if (channel) {
          const updatedChannel = {
            ...channel,
            isSubscribed: false,
            subscribersCount: Math.max(0, channel.subscribersCount - 1),
          };

          return {
            channels: state.channels.map((c) =>
              c.id === channelId ? updatedChannel : c
            ),
            subscriptions: state.subscriptions.filter((c) => c.id !== channelId),
          };
        }
        return state;
      });

      toast.success('Вы отписались от канала');
    } catch (error) {
      console.error('Error unsubscribing:', error);
      toast.error('Ошибка при отписке');
      throw error;
    }
  },

  createPost: async (channelId: string, content: string) => {
    try {
      const post = await channelsApi.createPost(channelId, { content });

      set((state) => {
        const channelPosts = state.posts[channelId] || [];

        return {
          posts: {
            ...state.posts,
            [channelId]: [post, ...channelPosts],
          },
        };
      });

      toast.success('Пост опубликован');
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error('Ошибка при создании поста');
      throw error;
    }
  },

  deletePost: async (postId: string) => {
    try {
      await channelsApi.deletePost(postId);

      set((state) => {
        const newPosts = { ...state.posts };

        Object.keys(newPosts).forEach((channelId) => {
          newPosts[channelId] = newPosts[channelId].filter((p) => p.id !== postId);
        });

        return { posts: newPosts };
      });

      toast.success('Пост удален');
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error('Ошибка при удалении поста');
      throw error;
    }
  },
}));
