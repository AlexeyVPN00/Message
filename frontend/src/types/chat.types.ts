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

export enum AttachmentType {
  IMAGE = 'image',
  VIDEO = 'video',
  AUDIO = 'audio',
  DOCUMENT = 'document',
}

export interface FileAttachment {
  id: string;
  fileName: string;
  fileUrl: string;
  fileType: AttachmentType;
  fileSize: number;
  mimeType: string;
  createdAt: Date;
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
  attachments?: FileAttachment[];
}

export interface CreateChatDto {
  participantId: string;
}

export interface SendMessageDto {
  chatId: string;
  content?: string;
  replyToMessageId?: string;
  attachments?: Array<{
    fileName: string;
    fileUrl: string;
    fileSize: number;
    mimeType: string;
  }>;
}

export interface TypingUser {
  userId: string;
  username: string;
}
