import { useState } from 'react';
import { Box, IconButton, Paper, Typography } from '@mui/material';
import { Download, InsertDriveFile } from '@mui/icons-material';
import { FileAttachment, AttachmentType } from '../../types/chat.types';
import { uploadApi } from '../../api/upload.api';
import { ImageViewer } from './ImageViewer';

interface MessageAttachmentProps {
  attachment: FileAttachment;
}

export const MessageAttachment = ({ attachment }: MessageAttachmentProps) => {
  const [imageViewerOpen, setImageViewerOpen] = useState(false);
  const fileUrl = uploadApi.getFileUrl(attachment.fileUrl);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = attachment.fileName;
    link.click();
  };

  if (attachment.fileType === AttachmentType.IMAGE) {
    return (
      <>
        <Box
          sx={{
            maxWidth: 300,
            borderRadius: 2,
            overflow: 'hidden',
            cursor: 'pointer',
            position: 'relative',
            '&:hover .download-btn': { opacity: 1 },
          }}
          onClick={() => setImageViewerOpen(true)}
        >
          <img src={fileUrl} alt={attachment.fileName} style={{ width: '100%', display: 'block' }} />
          <IconButton
            className="download-btn"
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              handleDownload();
            }}
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              bgcolor: 'rgba(0,0,0,0.5)',
              color: 'white',
              opacity: 0,
              transition: 'opacity 0.2s',
              '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' },
            }}
          >
            <Download fontSize="small" />
          </IconButton>
        </Box>

        <ImageViewer
          imageUrl={fileUrl}
          fileName={attachment.fileName}
          open={imageViewerOpen}
          onClose={() => setImageViewerOpen(false)}
        />
      </>
    );
  }

  if (attachment.fileType === AttachmentType.VIDEO) {
    return (
      <Box sx={{ maxWidth: 300, borderRadius: 2, overflow: 'hidden' }}>
        <video controls style={{ width: '100%', maxHeight: 300 }}>
          <source src={fileUrl} type={attachment.mimeType} />
        </video>
      </Box>
    );
  }

  // Document/Audio fallback
  return (
    <Paper
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        p: 1.5,
        maxWidth: 300,
        cursor: 'pointer',
        '&:hover': { bgcolor: 'action.hover' },
      }}
      onClick={handleDownload}
    >
      <InsertDriveFile sx={{ fontSize: 40, color: 'primary.main' }} />
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          variant="body2"
          sx={{
            fontWeight: 500,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {attachment.fileName}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {formatFileSize(attachment.fileSize)}
        </Typography>
      </Box>
      <IconButton size="small">
        <Download fontSize="small" />
      </IconButton>
    </Paper>
  );
};
