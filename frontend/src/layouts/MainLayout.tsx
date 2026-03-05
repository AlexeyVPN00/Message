import { ReactNode } from 'react';
import { Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Badge, Typography, Divider, IconButton, useTheme as useMuiTheme, useMediaQuery } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { AccountCircle, Chat, RssFeed, Notifications, Brightness4, Brightness7, Logout, Contacts } from '@mui/icons-material';
import { useTheme } from '../contexts/ThemeContext';
import { useNotificationsStore } from '../store/notificationsStore';
import { useAuthStore } from '../store/authStore';
import { Avatar } from '../components/common/Avatar';

interface MainLayoutProps {
  children: ReactNode;
}

const DRAWER_WIDTH = 280;

export const MainLayout = ({ children }: MainLayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { themeMode, toggleTheme } = useTheme();
  const { unreadCount } = useNotificationsStore();
  const { user, logout } = useAuthStore();
  const muiTheme = useMuiTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));

  const menuItems = [
    {
      title: 'Профиль',
      icon: <AccountCircle />,
      path: '/profile',
      color: '#48bb78',
    },
    {
      title: 'Диалоги',
      icon: <Chat />,
      path: '/chats',
      color: '#667eea',
    },
    {
      title: 'Контакты',
      icon: <Contacts />,
      path: '/contacts',
      color: '#4299e1',
    },
    {
      title: 'Новости',
      icon: <RssFeed />,
      path: '/feed',
      color: '#f093fb',
    },
    {
      title: 'Уведомления',
      icon: <Notifications />,
      path: '/notifications',
      color: '#ed8936',
      badge: unreadCount,
    },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const drawerContent = (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: (theme) =>
          theme.palette.mode === 'light'
            ? 'linear-gradient(180deg, #ffffff 0%, #f8f9ff 100%)'
            : 'linear-gradient(180deg, #1a1a2e 0%, #16213e 100%)',
      }}
    >
      {/* Шапка с профилем */}
      <Box
        sx={{
          p: 3,
          background: (theme) =>
            theme.palette.mode === 'light'
              ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
              : 'linear-gradient(135deg, #1a1a2e 0%, #2d3561 100%)',
          color: '#fff',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          },
        }}
        onClick={() => navigate('/profile')}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar
            src={user?.avatarUrl || undefined}
            alt={user?.username || 'User'}
            size={56}
          />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                fontSize: '1.1rem',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {user?.firstName && user?.lastName
                ? `${user.firstName} ${user.lastName}`
                : user?.username || 'Пользователь'}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                opacity: 0.9,
                fontSize: '0.85rem',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              @{user?.username || 'username'}
            </Typography>
          </Box>
        </Box>
      </Box>

      <Divider />

      {/* Навигация */}
      <List sx={{ flex: 1, py: 2 }}>
        {menuItems.map((item) => {
          const active = isActive(item.path);
          return (
            <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => navigate(item.path)}
                sx={{
                  mx: 1.5,
                  borderRadius: 2,
                  transition: 'all 0.2s ease',
                  background: active
                    ? (theme) =>
                        theme.palette.mode === 'light'
                          ? 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)'
                          : 'rgba(102, 126, 234, 0.15)'
                    : 'transparent',
                  '&:hover': {
                    background: (theme) =>
                      theme.palette.mode === 'light'
                        ? 'linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.15) 100%)'
                        : 'rgba(102, 126, 234, 0.2)',
                    transform: 'translateX(4px)',
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 48,
                    color: active ? item.color : 'text.secondary',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {item.badge ? (
                    <Badge badgeContent={item.badge} color="error" max={99}>
                      {item.icon}
                    </Badge>
                  ) : (
                    item.icon
                  )}
                </ListItemIcon>
                <ListItemText
                  primary={item.title}
                  primaryTypographyProps={{
                    fontWeight: active ? 600 : 400,
                    fontSize: '0.95rem',
                    color: active ? item.color : 'text.primary',
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <Divider />

      {/* Нижняя панель */}
      <Box sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton
            onClick={toggleTheme}
            sx={{
              flex: 1,
              borderRadius: 2,
              background: (theme) =>
                theme.palette.mode === 'light'
                  ? 'rgba(102, 126, 234, 0.1)'
                  : 'rgba(102, 126, 234, 0.15)',
              '&:hover': {
                background: (theme) =>
                  theme.palette.mode === 'light'
                    ? 'rgba(102, 126, 234, 0.2)'
                    : 'rgba(102, 126, 234, 0.25)',
              },
            }}
          >
            {themeMode === 'light' ? <Brightness4 /> : <Brightness7 />}
          </IconButton>
          <IconButton
            onClick={handleLogout}
            sx={{
              flex: 1,
              borderRadius: 2,
              background: (theme) =>
                theme.palette.mode === 'light'
                  ? 'rgba(245, 101, 101, 0.1)'
                  : 'rgba(252, 129, 129, 0.15)',
              color: 'error.main',
              '&:hover': {
                background: (theme) =>
                  theme.palette.mode === 'light'
                    ? 'rgba(245, 101, 101, 0.2)'
                    : 'rgba(252, 129, 129, 0.25)',
              },
            }}
          >
            <Logout />
          </IconButton>
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Боковая панель */}
      <Drawer
        variant="permanent"
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
            border: 'none',
            boxShadow: (theme) =>
              theme.palette.mode === 'light'
                ? '2px 0 12px rgba(102, 126, 234, 0.08)'
                : '2px 0 12px rgba(0, 0, 0, 0.3)',
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Основной контент */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minHeight: '100vh',
          background: (theme) =>
            theme.palette.mode === 'light'
              ? 'linear-gradient(180deg, #f8f9ff 0%, #ffffff 100%)'
              : 'linear-gradient(180deg, #0f0f23 0%, #1a1a2e 100%)',
          overflow: 'auto',
        }}
      >
        {children}
      </Box>
    </Box>
  );
};
