import React from 'react';
import { Avatar as MuiAvatar, Badge } from '@mui/material';
import { Person } from '@mui/icons-material';
import { uploadApi } from '../../api/upload.api';

interface AvatarProps {
  src?: string;
  alt?: string;
  size?: number;
  online?: boolean;
}

export const Avatar = React.memo(({ src, alt = 'User', size = 40, online }: AvatarProps) => {
  const avatarUrl = src ? uploadApi.getFileUrl(src) : undefined;

  const avatarElement = (
    <MuiAvatar
      src={avatarUrl}
      alt={alt}
      sx={{
        width: size,
        height: size,
        background: avatarUrl
          ? undefined
          : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        border: '2px solid',
        borderColor: (theme) =>
          theme.palette.mode === 'light'
            ? 'rgba(102, 126, 234, 0.2)'
            : 'rgba(139, 159, 245, 0.3)',
        boxShadow: (theme) =>
          theme.palette.mode === 'light'
            ? '0 2px 8px rgba(102, 126, 234, 0.15)'
            : '0 2px 8px rgba(139, 159, 245, 0.25)',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'scale(1.05)',
          boxShadow: (theme) =>
            theme.palette.mode === 'light'
              ? '0 4px 12px rgba(102, 126, 234, 0.25)'
              : '0 4px 12px rgba(139, 159, 245, 0.35)',
        },
      }}
    >
      {!avatarUrl && <Person />}
    </MuiAvatar>
  );

  if (online !== undefined) {
    return (
      <Badge
        overlap="circular"
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        variant="dot"
        sx={{
          '& .MuiBadge-badge': {
            backgroundColor: online ? '#44b700' : '#999',
            color: online ? '#44b700' : '#999',
            boxShadow: (theme) => `0 0 0 2px ${theme.palette.background.paper}`,
            '&::after': online
              ? {
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  animation: 'ripple 1.2s infinite ease-in-out',
                  border: '1px solid currentColor',
                  content: '""',
                }
              : {},
          },
          '@keyframes ripple': {
            '0%': {
              transform: 'scale(.8)',
              opacity: 1,
            },
            '100%': {
              transform: 'scale(2.4)',
              opacity: 0,
            },
          },
        }}
      >
        {avatarElement}
      </Badge>
    );
  }

  return avatarElement;
});
