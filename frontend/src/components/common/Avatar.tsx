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
        bgcolor: 'primary.main',
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
