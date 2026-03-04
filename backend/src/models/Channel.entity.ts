import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  Index,
  JoinColumn,
} from 'typeorm';
import { User } from './User.entity';
import { ChannelSubscriber } from './ChannelSubscriber.entity';
import { ChannelPost } from './ChannelPost.entity';

@Entity('channels')
export class Channel {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ name: 'avatar_url', length: 500, nullable: true })
  avatarUrl?: string;

  @Column({ name: 'owner_id', type: 'uuid' })
  @Index()
  ownerId: string;

  @Column({ name: 'is_private', default: false })
  @Index()
  isPrivate: boolean;

  @Column({ name: 'subscribers_count', default: 0 })
  subscribersCount: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => User, (user) => user.ownedChannels, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'owner_id' })
  owner: User;

  @OneToMany(() => ChannelSubscriber, (subscriber) => subscriber.channel)
  subscribers: ChannelSubscriber[];

  @OneToMany(() => ChannelPost, (post) => post.channel)
  posts: ChannelPost[];
}
