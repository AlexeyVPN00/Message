import React from 'react';
import {
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  IconButton,
  Typography,
  Box,
} from '@mui/material';
import {
  Delete,
  Message,
  Favorite,
  Comment,
  Article,
  GroupAdd,
  PersonAdd,
} from '@mui/icons-material';
import { Notification, NotificationType } from '../../types/notification.types';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
}

const getNotificationIcon = (type: NotificationType) => {
  switch (type) {
    case NotificationType.MESSAGE:
      return <Message />;
    case NotificationType.LIKE:
      return <Favorite color="error" />;
    case NotificationType.COMMENT:
      return <Comment />;
    case NotificationType.CHANNEL_POST:
      return <Article />;
    case NotificationType.CHAT_INVITE:
      return <GroupAdd />;
    case NotificationType.CHANNEL_SUBSCRIBE:
      return <PersonAdd />;
    default:
      return <Message />;
  }
};

export const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onMarkAsRead,
  onDelete,
}) => {
  const handleClick = () => {
    if (!notification.isRead) {
      onMarkAsRead(notification.id);
    }
  };

  const timeAgo = formatDistanceToNow(new Date(notification.createdAt), {
    addSuffix: true,
    locale: ru,
  });

  return (
    <ListItem
      sx={{
        bgcolor: notification.isRead ? 'transparent' : 'action.hover',
        borderBottom: 1,
        borderColor: 'divider',
        cursor: 'pointer',
        '&:hover': {
          bgcolor: 'action.selected',
        },
      }}
      onClick={handleClick}
      secondaryAction={
        <IconButton
          edge="end"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(notification.id);
          }}
        >
          <Delete />
        </IconButton>
      }
    >
      <ListItemAvatar>
        <Avatar sx={{ bgcolor: notification.isRead ? 'action.disabled' : 'primary.main' }}>
          {getNotificationIcon(notification.type)}
        </Avatar>
      </ListItemAvatar>
      <ListItemText
        primary={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: notification.isRead ? 'normal' : 'bold',
                flex: 1,
              }}
            >
              {notification.title}
            </Typography>
            {!notification.isRead && (
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  bgcolor: 'primary.main',
                }}
              />
            )}
          </Box>
        }
        secondary={
          <>
            {notification.message && (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                {notification.message}
              </Typography>
            )}
            <Typography variant="caption" color="text.secondary">
              {timeAgo}
            </Typography>
          </>
        }
      />
    </ListItem>
  );
};
