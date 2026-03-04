import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { ChatMember } from './ChatMember.entity';
import { Message } from './Message.entity';
import { Channel } from './Channel.entity';
import { ChannelSubscriber } from './ChannelSubscriber.entity';
import { Post } from './Post.entity';
import { PostLike } from './PostLike.entity';
import { Comment } from './Comment.entity';
import { Notification } from './Notification.entity';
import { FileAttachment } from './FileAttachment.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 255 })
  @Index()
  email: string;

  @Column({ unique: true, length: 50 })
  @Index()
  username: string;

  @Column({ name: 'password_hash', length: 255 })
  passwordHash: string;

  @Column({ name: 'first_name', length: 100, nullable: true })
  firstName?: string;

  @Column({ name: 'last_name', length: 100, nullable: true })
  lastName?: string;

  @Column({ type: 'text', nullable: true })
  bio?: string;

  @Column({ name: 'avatar_url', length: 500, nullable: true })
  avatarUrl?: string;

  @Column({ length: 20, nullable: true })
  phone?: string;

  @Column({ name: 'is_online', default: false })
  @Index()
  isOnline: boolean;

  @Column({ name: 'last_seen', type: 'timestamp', nullable: true })
  lastSeen?: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @OneToMany(() => ChatMember, (chatMember) => chatMember.user)
  chatMemberships: ChatMember[];

  @OneToMany(() => Message, (message) => message.sender)
  messages: Message[];

  @OneToMany(() => Channel, (channel) => channel.owner)
  ownedChannels: Channel[];

  @OneToMany(() => ChannelSubscriber, (subscription) => subscription.user)
  channelSubscriptions: ChannelSubscriber[];

  @OneToMany(() => Post, (post) => post.author)
  posts: Post[];

  @OneToMany(() => PostLike, (like) => like.user)
  postLikes: PostLike[];

  @OneToMany(() => Comment, (comment) => comment.author)
  comments: Comment[];

  @OneToMany(() => Notification, (notification) => notification.recipient)
  notifications: Notification[];

  @OneToMany(() => FileAttachment, (file) => file.uploadedBy)
  uploadedFiles: FileAttachment[];
}
