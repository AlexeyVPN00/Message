import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  Index,
  JoinColumn,
} from 'typeorm';
import { Channel } from './Channel.entity';
import { User } from './User.entity';

@Entity('channel_posts')
export class ChannelPost {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'channel_id', type: 'uuid' })
  @Index()
  channelId: string;

  @Column({ name: 'author_id', type: 'uuid' })
  @Index()
  authorId: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ name: 'views_count', default: 0 })
  viewsCount: number;

  @CreateDateColumn({ name: 'created_at' })
  @Index()
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Channel, (channel) => channel.posts, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'channel_id' })
  channel: Channel;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'author_id' })
  author: User;
}
