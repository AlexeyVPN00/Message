import { Repository } from 'typeorm';
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
