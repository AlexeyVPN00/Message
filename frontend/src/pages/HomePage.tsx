import { Box, Container, Typography, Button, Card, CardContent, Grid, alpha } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { MainLayout } from '../layouts/MainLayout';
import { Chat, RssFeed, Notifications, AccountCircle, Celebration } from '@mui/icons-material';

export const HomePage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  const features = [
    {
      icon: <AccountCircle sx={{ fontSize: 48 }} />,
      title: 'Профиль',
      description: 'Настройте свой профиль и аватар',
      color: '#48bb78',
      route: '/profile',
    },
    {
      icon: <Chat sx={{ fontSize: 48 }} />,
      title: 'Диалоги',
      description: 'Общайтесь в личных и групповых чатах',
      color: '#667eea',
      route: '/chats',
    },
    {
      icon: <RssFeed sx={{ fontSize: 48 }} />,
      title: 'Новости',
      description: 'Делитесь моментами жизни с друзьями',
      color: '#f093fb',
      route: '/feed',
    },
    {
      icon: <Notifications sx={{ fontSize: 48 }} />,
      title: 'Уведомления',
      description: 'Будьте в курсе всех событий',
      color: '#ed8936',
      route: '/notifications',
    },
  ];

  if (!isAuthenticated) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          background: (theme) =>
            theme.palette.mode === 'light'
              ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
              : 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 100%)',
        }}
      >
        <Container maxWidth="md">
          <Box
            sx={{
              minHeight: '100vh',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              textAlign: 'center',
              gap: 4,
              py: 4,
            }}
          >
            {/* Иконка */}
            <Box
              sx={{
                width: 120,
                height: 120,
                borderRadius: '32px',
                background: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(10px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
              }}
            >
              <Chat sx={{ fontSize: 64, color: '#fff' }} />
            </Box>

            <Typography
              variant="h2"
              component="h1"
              sx={{
                fontWeight: 800,
                color: '#fff',
                textShadow: '0 2px 20px rgba(0, 0, 0, 0.2)',
                fontSize: { xs: '2.5rem', md: '3.5rem' },
              }}
            >
              Добро пожаловать в<br />
              Messenger
            </Typography>

            <Typography
              variant="h5"
              sx={{
                color: 'rgba(255, 255, 255, 0.9)',
                maxWidth: 600,
                fontSize: { xs: '1.1rem', md: '1.5rem' },
              }}
            >
              Современный мессенджер с элементами социальной сети
            </Typography>

            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate('/login')}
                sx={{
                  py: 1.5,
                  px: 4,
                  fontSize: '1.1rem',
                  background: '#fff',
                  color: '#667eea',
                  '&:hover': {
                    background: '#f0f0f0',
                  },
                }}
              >
                Войти
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={() => navigate('/register')}
                sx={{
                  py: 1.5,
                  px: 4,
                  fontSize: '1.1rem',
                  borderColor: '#fff',
                  color: '#fff',
                  '&:hover': {
                    borderColor: '#fff',
                    background: 'rgba(255, 255, 255, 0.1)',
                  },
                }}
              >
                Регистрация
              </Button>
            </Box>

            {/* Фичи */}
            <Grid container spacing={3} sx={{ mt: 4, maxWidth: 800 }}>
              {features.map((feature, index) => (
                <Grid item xs={6} md={3} key={index}>
                  <Card
                    sx={{
                      background: 'rgba(255, 255, 255, 0.1)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      textAlign: 'center',
                      p: 2,
                      height: '100%',
                    }}
                  >
                    <Box sx={{ color: '#fff', mb: 1 }}>{feature.icon}</Box>
                    <Typography
                      variant="h6"
                      sx={{ color: '#fff', fontWeight: 600, fontSize: '1rem' }}
                    >
                      {feature.title}
                    </Typography>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Container>
      </Box>
    );
  }

  return (
    <MainLayout>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Приветствие */}
        <Box
          sx={{
            mb: 4,
            p: 4,
            borderRadius: 4,
            background: (theme) =>
              theme.palette.mode === 'light'
                ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                : 'linear-gradient(135deg, #1a1a2e 0%, #2d3561 100%)',
            color: '#fff',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Celebration sx={{ fontSize: 40 }} />
              <Typography variant="h3" sx={{ fontWeight: 800 }}>
                С возвращением!
              </Typography>
            </Box>
            <Typography variant="h6" sx={{ opacity: 0.9 }}>
              Все функции готовы к использованию. Начните общаться прямо сейчас!
            </Typography>
          </Box>
        </Box>

        {/* Карточки функций */}
        <Grid container spacing={3}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card
                onClick={() => navigate(feature.route)}
                sx={{
                  height: '100%',
                  cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: (theme) =>
                      theme.palette.mode === 'light'
                        ? '0 12px 40px rgba(102, 126, 234, 0.25)'
                        : '0 12px 40px rgba(139, 159, 245, 0.3)',
                  },
                }}
              >
                <CardContent sx={{ textAlign: 'center', p: 3 }}>
                  <Box
                    sx={{
                      width: 80,
                      height: 80,
                      borderRadius: '20px',
                      background: `linear-gradient(135deg, ${feature.color} 0%, ${alpha(
                        feature.color,
                        0.6
                      )} 100%)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 16px',
                      color: '#fff',
                    }}
                  >
                    {feature.icon}
                  </Box>
                  <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Статус проекта */}
        <Card sx={{ mt: 4, p: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
            🎉 Проект завершен!
          </Typography>
          <Grid container spacing={2}>
            {[
              'Инфраструктура',
              'Аутентификация',
              'Профили',
              'Личные чаты',
              'Групповые чаты',
              'Каналы',
              'Новостная лента',
              'Уведомления',
              'Темы оформления',
              'Оптимизация',
              'Деплой',
            ].map((stage, index) => (
              <Grid item xs={6} sm={4} md={3} key={index}>
                <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box
                    component="span"
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #48bb78 0%, #68d391 100%)',
                    }}
                  />
                  {stage}
                </Typography>
              </Grid>
            ))}
          </Grid>
        </Card>
      </Container>
    </MainLayout>
  );
};
