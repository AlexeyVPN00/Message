import { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  IconButton,
  List,
  CircularProgress,
  Tabs,
  Tab,
  Menu,
  MenuItem,
  Paper,
} from '@mui/material';
import { MoreVert } from '@mui/icons-material';
import { useNotificationsStore } from '../../store/notificationsStore';
import { NotificationItem } from '../../components/notifications/NotificationItem';
import { MainLayout } from '../../layouts/MainLayout';

export const NotificationsPage = () => {
  const {
    notifications,
    isLoading,
    loadNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllRead,
  } = useNotificationsStore();

  const [tabValue, setTabValue] = useState(0);
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);

  useEffect(() => {
    const unreadOnly = tabValue === 1;
    loadNotifications(unreadOnly);
  }, [tabValue, loadNotifications]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
    handleMenuClose();
  };

  const handleDeleteAllRead = async () => {
    await deleteAllRead();
    handleMenuClose();
  };

  const unreadNotifications = notifications.filter((n) => !n.isRead);
  const hasUnread = unreadNotifications.length > 0;
  const hasRead = notifications.some((n) => n.isRead);

  return (
    <MainLayout>
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Container maxWidth="md" sx={{ py: 0, flex: 1, display: 'flex', flexDirection: 'column' }}>
          {/* Заголовок и меню */}
          <Box sx={{ display: 'flex', alignItems: 'center', py: 2, gap: 2 }}>
            <Typography variant="h5" sx={{ flexGrow: 1, fontWeight: 600 }}>
              Уведомления
            </Typography>
            <IconButton onClick={handleMenuOpen}>
              <MoreVert />
            </IconButton>
            <Menu anchorEl={menuAnchorEl} open={Boolean(menuAnchorEl)} onClose={handleMenuClose}>
              <MenuItem onClick={handleMarkAllAsRead} disabled={!hasUnread}>
                Отметить все как прочитанные
              </MenuItem>
              <MenuItem onClick={handleDeleteAllRead} disabled={!hasRead}>
                Удалить все прочитанные
              </MenuItem>
            </Menu>
          </Box>

          {/* Вкладки */}
          <Paper elevation={0} sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
            <Tabs value={tabValue} onChange={handleTabChange}>
              <Tab label="Все" />
              <Tab label={`Непрочитанные (${unreadNotifications.length})`} />
            </Tabs>
          </Paper>

          {/* Список уведомлений */}
          <Box sx={{ flex: 1, overflow: 'auto' }}>
            {isLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                <CircularProgress />
              </Box>
            ) : notifications.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Typography variant="h6" color="text.secondary">
                  {tabValue === 0 ? 'Нет уведомлений' : 'Нет непрочитанных уведомлений'}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  {tabValue === 0
                    ? 'Здесь будут отображаться ваши уведомления'
                    : 'Все уведомления прочитаны'}
                </Typography>
              </Box>
            ) : (
              <List sx={{ p: 0 }}>
                {notifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onMarkAsRead={markAsRead}
                    onDelete={deleteNotification}
                  />
                ))}
              </List>
            )}
          </Box>
        </Container>
      </Box>
    </MainLayout>
  );
};
