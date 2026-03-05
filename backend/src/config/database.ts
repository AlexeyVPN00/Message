import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { User } from '../models/User.entity';
import { Chat } from '../models/Chat.entity';
import { ChatMember } from '../models/ChatMember.entity';
import { Message } from '../models/Message.entity';
import { Channel } from '../models/Channel.entity';
import { ChannelSubscriber } from '../models/ChannelSubscriber.entity';
import { ChannelPost } from '../models/ChannelPost.entity';
import { Post } from '../models/Post.entity';
import { PostLike } from '../models/PostLike.entity';
import { Comment } from '../models/Comment.entity';
import { Notification } from '../models/Notification.entity';
import { FileAttachment } from '../models/FileAttachment.entity';
import { Contact } from '../models/Contact.entity';

dotenv.config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5433'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_DATABASE || 'messenger',
  synchronize: process.env.NODE_ENV === 'development', // Auto-sync schema in dev
  logging: process.env.NODE_ENV === 'development',
  entities: [
    User,
    Chat,
    ChatMember,
    Message,
    Channel,
    ChannelSubscriber,
    ChannelPost,
    Post,
    PostLike,
    Comment,
    Notification,
    FileAttachment,
    Contact,
  ],
  migrations: ['src/database/migrations/**/*.ts'],
  subscribers: [],
});

export const initializeDatabase = async () => {
  try {
    await AppDataSource.initialize();
    console.log('✅ Database connection established');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    throw error;
  }
};
