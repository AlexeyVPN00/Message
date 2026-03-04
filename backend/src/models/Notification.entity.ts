import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  Index,
  JoinColumn,
} from 'typeorm';
import { User } from './User.entity';

export enum NotificationType {
  MESSAGE = 'message',
  MENTION = 'mention',
  LIKE = 'like',
  COMMENT = 'comment',
  CHANNEL_POST = 'channel_post',
  CHAT_INVITE = 'chat_invite',
  CHANNEL_SUBSCRIBE = 'channel_subscribe',
}

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'recipient_id', type: 'uuid' })
  @Index()
  recipientId: string;

  @Column({
    type: 'enum',
    enum: NotificationType,
  })
  type: NotificationType;

  @Column({ length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  message?: string;

  @Column({ type: 'jsonb', nullable: true })
  data: Record<string, any> | null;

  @Column({ name: 'is_read', default: false })
  @Index()
  isRead: boolean;

  @CreateDateColumn({ name: 'created_at' })
  @Index()
  createdAt: Date;

  // Relations
  @ManyToOne(() => User, (user) => user.notifications, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'recipient_id' })
  recipient: User;
}
