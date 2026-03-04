export enum NotificationType {
  MESSAGE = 'message',
  MENTION = 'mention',
  LIKE = 'like',
  COMMENT = 'comment',
  CHANNEL_POST = 'channel_post',
  CHAT_INVITE = 'chat_invite',
  CHANNEL_SUBSCRIBE = 'channel_subscribe',
}

export interface Notification {
  id: string;
  recipientId: string;
  type: NotificationType;
  title: string;
  message?: string;
  data: Record<string, any> | null;
  isRead: boolean;
  createdAt: Date;
}
