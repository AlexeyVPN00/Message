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

export enum AttachmentType {
  IMAGE = 'image',
  VIDEO = 'video',
  AUDIO = 'audio',
  DOCUMENT = 'document',
}

export enum AttachmentContext {
  MESSAGE = 'message',
  POST = 'post',
  CHANNEL_POST = 'channel_post',
  AVATAR = 'avatar',
}

@Entity('file_attachments')
@Index(['context', 'contextId'])
export class FileAttachment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'file_name', length: 255 })
  fileName: string;

  @Column({ name: 'file_url', length: 500 })
  fileUrl: string;

  @Column({
    name: 'file_type',
    type: 'enum',
    enum: AttachmentType,
  })
  fileType: AttachmentType;

  @Column({ name: 'file_size', nullable: true })
  fileSize?: number;

  @Column({ name: 'mime_type', length: 100, nullable: true })
  mimeType?: string;

  @Column({
    type: 'enum',
    enum: AttachmentContext,
  })
  context: AttachmentContext;

  @Column({ name: 'context_id', type: 'uuid' })
  contextId: string;

  @Column({ name: 'uploaded_by', type: 'uuid', nullable: true })
  uploadedById?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  // Relations
  @ManyToOne(() => User, (user) => user.uploadedFiles, { nullable: true })
  @JoinColumn({ name: 'uploaded_by' })
  uploadedBy: User | null;
}
