import { useState, useEffect } from 'react';
import { Box, IconButton, Typography, Paper } from '@mui/material';
import { Close, InsertDriveFile } from '@mui/icons-material';

interface AttachmentPreviewProps {
  file: File;
  onRemove: () => void;
}

export const AttachmentPreview = ({ file, onRemove }: AttachmentPreviewProps) => {
  const isImage = file.type.startsWith('image/');
  const isVideo = file.type.startsWith('video/');
  const [preview, setPreview] = useState<string>('');

  useEffect(() => {
    if (isImage || isVideo) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [file]);

  return (
    <Paper
      sx={{
        position: 'relative',
        width: 100,
        height: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      {isImage && preview ? (
        <img src={preview} alt={file.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      ) : isVideo && preview ? (
        <video src={preview} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      ) : (
        <InsertDriveFile sx={{ fontSize: 40, color: 'text.secondary' }} />
      )}

      <IconButton
        size="small"
        onClick={onRemove}
        sx={{
          position: 'absolute',
          top: 2,
          right: 2,
          bgcolor: 'rgba(0,0,0,0.5)',
          color: 'white',
          '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' },
        }}
      >
        <Close fontSize="small" />
      </IconButton>

      <Typography
        variant="caption"
        sx={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          bgcolor: 'rgba(0,0,0,0.6)',
          color: 'white',
          p: 0.5,
          fontSize: '0.65rem',
          textOverflow: 'ellipsis',
          overflow: 'hidden',
          whiteSpace: 'nowrap',
        }}
      >
        {file.name}
      </Typography>
    </Paper>
  );
};
