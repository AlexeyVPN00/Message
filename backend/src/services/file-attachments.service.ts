import { Repository, In } from 'typeorm';
import { AppDataSource } from '../config/database';
import { FileAttachment, AttachmentType, AttachmentContext } from '../models/FileAttachment.entity';
import { uploadService } from './upload.service';

export interface CreateAttachmentDto {
  fileName: string;
  fileUrl: string;
  fileType: AttachmentType;
  fileSize: number;
  mimeType: string;
  context: AttachmentContext;
  contextId: string;
  uploadedById: string;
}

export class FileAttachmentsService {
  private attachmentRepository: Repository<FileAttachment>;

  constructor() {
    this.attachmentRepository = AppDataSource.getRepository(FileAttachment);
  }

  async createAttachments(attachmentsData: CreateAttachmentDto[]): Promise<FileAttachment[]> {
    const attachments = this.attachmentRepository.create(attachmentsData);
    return await this.attachmentRepository.save(attachments);
  }

  async getAttachmentsByContext(
    context: AttachmentContext,
    contextId: string
  ): Promise<FileAttachment[]> {
    return await this.attachmentRepository.find({
      where: { context, contextId },
      order: { createdAt: 'ASC' },
    });
  }

  /**
   * FIX N+1: Batch load attachments for multiple context IDs
   * Instead of N queries (one per message), this makes 1 query for all messages
   */
  async getAttachmentsByContextIds(
    context: AttachmentContext,
    contextIds: string[]
  ): Promise<Map<string, FileAttachment[]>> {
    if (contextIds.length === 0) {
      return new Map();
    }

    const attachments = await this.attachmentRepository.find({
      where: {
        context,
        contextId: In(contextIds)
      },
      order: { createdAt: 'ASC' },
    });

    // Group attachments by contextId
    const attachmentMap = new Map<string, FileAttachment[]>();

    for (const attachment of attachments) {
      const existing = attachmentMap.get(attachment.contextId) || [];
      existing.push(attachment);
      attachmentMap.set(attachment.contextId, existing);
    }

    return attachmentMap;
  }

  async deleteAttachmentsByContext(
    context: AttachmentContext,
    contextId: string
  ): Promise<void> {
    const attachments = await this.getAttachmentsByContext(context, contextId);

    // Delete physical files
    for (const attachment of attachments) {
      await uploadService.deleteFile(attachment.fileUrl);
    }

    // Delete from database
    await this.attachmentRepository.delete({ context, contextId });
  }

  determineFileType(mimeType: string): AttachmentType {
    if (mimeType.startsWith('image/')) return AttachmentType.IMAGE;
    if (mimeType.startsWith('video/')) return AttachmentType.VIDEO;
    if (mimeType.startsWith('audio/')) return AttachmentType.AUDIO;
    return AttachmentType.DOCUMENT;
  }
}

export const fileAttachmentsService = new FileAttachmentsService();
