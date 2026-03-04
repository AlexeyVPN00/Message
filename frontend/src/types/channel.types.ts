import { User } from './user.types';

export interface Channel {
  id: string;
  name: string;
  description?: string;
  avatarUrl?: string;
  ownerId: string;
  isPrivate: boolean;
  subscribersCount: number;
  createdAt: Date;
  updatedAt: Date;
  owner: User;
  isSubscribed?: boolean; // Добавляется для текущего пользователя
}

export interface ChannelSubscriber {
  id: string;
  channelId: string;
  userId: string;
  subscribedAt: Date;
  user: User;
  channel: Channel;
}

export interface ChannelPost {
  id: string;
  channelId: string;
  authorId: string;
  content: string;
  viewsCount: number;
  createdAt: Date;
  updatedAt: Date;
  author: User;
  channel: Channel;
}

export interface CreateChannelDto {
  name: string;
  description?: string;
  isPrivate?: boolean;
}

export interface UpdateChannelDto {
  name?: string;
  description?: string;
  avatarUrl?: string;
  isPrivate?: boolean;
}

export interface CreateChannelPostDto {
  content: string;
}
