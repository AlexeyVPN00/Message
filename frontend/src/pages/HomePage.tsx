import { Box, Container, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { ThemeToggle } from '../components/common/ThemeToggle';
import { NotificationBadge } from '../components/notifications/NotificationBadge';
import { useTheme } from '../contexts/ThemeContext';

export const HomePage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const { themeMode } = useTheme();

  return (
    <Container maxWidth="md">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
          gap: 3,
        }}
      >
        <Box sx={{ position: 'absolute', top: 16, right: 16, display: 'flex', gap: 1 }}>
          {isAuthenticated && <NotificationBadge />}
          <ThemeToggle />
        </Box>

        <Typography variant="h2" component="h1" gutterBottom>
          Добро пожаловать в Messenger
        </Typography>

        <Typography variant="h5" color="text.secondary" paragraph>
          Веб-мессенджер с элементами социальной сети
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, mt: 4, flexWrap: 'wrap', justifyContent: 'center' }}>
          {isAuthenticated ? (
            <>
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate('/chats')}
              >
                Открыть чаты
              </Button>
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate('/channels')}
              >
                Каналы
              </Button>
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate('/feed')}
              >
                Лента
              </Button>
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate('/notifications')}
              >
                Уведомления
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={() => navigate('/profile')}
              >
                Мой профиль
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate('/login')}
              >
                Войти
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={() => navigate('/register')}
              >
                Регистрация
              </Button>
            </>
          )}
        </Box>

        <Box sx={{ mt: 6, p: 3, bgcolor: 'background.paper', borderRadius: 2, maxWidth: '600px' }}>
          <Typography variant="h6" gutterBottom>
            Функции:
          </Typography>
          <Typography variant="body1" paragraph textAlign="left">
            • 💬 Личные и групповые чаты<br />
            • 📢 Каналы<br />
            • 📰 Новостная лента<br />
            • 👤 Профили пользователей<br />
            • 🔔 Уведомления<br />
            • 🎨 Светлая и темная темы (текущая: {themeMode === 'light' ? 'светлая' : 'темная "Миднайт"'})
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            ✅ Этап 1: Инфраструктура завершен<br />
            ✅ Этап 2: Аутентификация завершен<br />
            ✅ Этап 3: Профили пользователей завершен<br />
            ✅ Этап 4: Личные чаты с WebSocket завершен<br />
            ✅ Этап 5: Групповые чаты завершен<br />
            ✅ Этап 6: Каналы завершен<br />
            ✅ Этап 7: Новостная лента завершен<br />
            ✅ Этап 8: Уведомления завершен<br />
            ✅ Этап 9: Темы оформления завершен<br />
            ✅ Этап 10: Оптимизация завершен
          </Typography>
        </Box>
      </Box>
    </Container>
  );
};
