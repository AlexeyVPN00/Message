import { useState } from 'react';
import { Dialog, IconButton, Box } from '@mui/material';
import { Close, Download } from '@mui/icons-material';

interface ImageViewerProps {
  imageUrl: string;
  fileName: string;
  open: boolean;
  onClose: () => void;
}

export const ImageViewer = ({ imageUrl, fileName, open, onClose }: ImageViewerProps) => {
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = fileName;
    link.click();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      PaperProps={{
        sx: {
          backgroundColor: 'rgba(0, 0, 0, 0.9)',
          boxShadow: 'none',
          maxWidth: '95vw',
          maxHeight: '95vh',
        },
      }}
    >
      <Box
        sx={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minWidth: 300,
          minHeight: 300,
        }}
      >
        {/* Close button */}
        <IconButton
          onClick={onClose}
          sx={{
            position: 'absolute',
            top: 16,
            right: 16,
            color: 'white',
            bgcolor: 'rgba(0, 0, 0, 0.5)',
            '&:hover': {
              bgcolor: 'rgba(0, 0, 0, 0.7)',
            },
            zIndex: 1,
          }}
        >
          <Close />
        </IconButton>

        {/* Download button */}
        <IconButton
          onClick={handleDownload}
          sx={{
            position: 'absolute',
            top: 16,
            right: 72,
            color: 'white',
            bgcolor: 'rgba(0, 0, 0, 0.5)',
            '&:hover': {
              bgcolor: 'rgba(0, 0, 0, 0.7)',
            },
            zIndex: 1,
          }}
        >
          <Download />
        </IconButton>

        {/* Image */}
        <img
          src={imageUrl}
          alt={fileName}
          style={{
            maxWidth: '100%',
            maxHeight: '95vh',
            objectFit: 'contain',
            display: 'block',
          }}
          onClick={(e) => e.stopPropagation()}
        />
      </Box>
    </Dialog>
  );
};
