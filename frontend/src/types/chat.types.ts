import { User } from './user.types';

export enum ChatType {
  PRIVATE = 'private',
  GROUP = 'group',
}

export enum MemberRole {
  OWNER = 'owner',
  ADMIN = 'admin',
  MEMBER = 'member',
}

export interface ChatMember {
  id: string;
  chatId: string;
  userId: string;
  role: MemberRole;
  joinedAt: Date;
  lastReadMessageId?: string;
  user: User;
}

export interface Chat {
  id: string;
  type: ChatType;
  name?: string;
  description?: string;
  avatarUrl?: string;
  createdBy?: string;
  createdAt: Date;
  updatedAt: Date;
  members: ChatMember[];
  lastMessage?: Message;
  unreadCount?: number;
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  content: string;
  replyToMessageId?: string;
  isEdited: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
  sender: User;
  replyToMessage?: Message;
}

export interface CreateChatDto {
  participantId: string;
}

export interface SendMessageDto {
  chatId: string;
  content: string;
  replyToMessageId?: string;
}

export interface TypingUser {
  userId: string;
  username: string;
}
