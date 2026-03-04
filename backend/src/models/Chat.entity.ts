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
import { ChatMember } from './ChatMember.entity';
import { Message } from './Message.entity';

export enum ChatType {
  PRIVATE = 'private',
  GROUP = 'group',
}

@Entity('chats')
export class Chat {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: ChatType,
  })
  @Index()
  type: ChatType;

  @Column({ length: 255, nullable: true })
  name?: string; // Только для групповых чатов

  @Column({ type: 'text', nullable: true })
  description?: string; // Только для групповых чатов

  @Column({ name: 'avatar_url', length: 500, nullable: true })
  avatarUrl?: string; // Только для групповых чатов

  @Column({ name: 'created_by', type: 'uuid', nullable: true })
  @Index()
  createdBy?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'created_by' })
  creator?: User;

  @OneToMany(() => ChatMember, (member) => member.chat, { cascade: true })
  members: ChatMember[];

  @OneToMany(() => Message, (message) => message.chat, { cascade: true })
  messages: Message[];
}
