import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  Index,
  JoinColumn,
  Unique,
} from 'typeorm';
import { Channel } from './Channel.entity';
import { User } from './User.entity';

@Entity('channel_subscribers')
@Unique(['channelId', 'userId'])
export class ChannelSubscriber {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'channel_id', type: 'uuid' })
  @Index()
  channelId: string;

  @Column({ name: 'user_id', type: 'uuid' })
  @Index()
  userId: string;

  @CreateDateColumn({ name: 'subscribed_at' })
  subscribedAt: Date;

  // Relations
  @ManyToOne(() => Channel, (channel) => channel.subscribers, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'channel_id' })
  channel: Channel;

  @ManyToOne(() => User, (user) => user.channelSubscriptions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
