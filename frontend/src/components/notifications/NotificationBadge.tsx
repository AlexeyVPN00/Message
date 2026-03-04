import React, { useEffect } from 'react';
import { IconButton, Badge, Tooltip } from '@mui/material';
import { Notifications } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useNotificationsStore } from '../../store/notificationsStore';

export const NotificationBadge: React.FC = () => {
  const navigate = useNavigate();
  const { unreadCount, loadUnreadCount } = useNotificationsStore();

  useEffect(() => {
    loadUnreadCount();

    // Обновляем счетчик каждые 30 секунд
    const interval = setInterval(() => {
      loadUnreadCount();
    }, 30000);

    return () => clearInterval(interval);
  }, [loadUnreadCount]);

  return (
    <Tooltip title="Уведомления">
      <IconButton color="inherit" onClick={() => navigate('/notifications')}>
        <Badge badgeContent={unreadCount} color="error">
          <Notifications />
        </Badge>
      </IconButton>
    </Tooltip>
  );
};
