import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Paper,
  Typography,
  Button,
  CircularProgress,
  Divider,
  Grid,
} from '@mui/material';
import { Edit, Email, Phone, CalendarToday } from '@mui/icons-material';
import { usersApi } from '../../api/users.api';
import { User } from '../../types/user.types';
import { Avatar } from '../../components/common/Avatar';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';

export const ProfilePage = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuthStore();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const isOwnProfile = !userId || userId === currentUser?.id;
  const profileUserId = userId || currentUser?.id;

  useEffect(() => {
    const loadUser = async () => {
      if (!profileUserId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const userData = await usersApi.getUserById(profileUserId);
        setUser(userData);
      } catch (error) {
        console.error('Error loading user:', error);
        toast.error('Ошибка при загрузке профиля');
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [profileUserId]);

  if (loading) {
    return (
      <Container maxWidth="md">
        <Box
          sx={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (!user) {
    return (
      <Container maxWidth="md">
        <Box sx={{ py: 4 }}>
          <Typography variant="h5">Пользователь не найден</Typography>
          <Button onClick={() => navigate('/')} sx={{ mt: 2 }}>
            На главную
          </Button>
        </Box>
      </Container>
    );
  }

  const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ') || user.username;

  return (
    <Container maxWidth="md">
      <Box sx={{ py: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          {/* Шапка профиля */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 3,
              mb: 3,
            }}
          >
            <Avatar src={user.avatarUrl} alt={fullName} size={120} online={user.isOnline} />

            <Box sx={{ flex: 1 }}>
              <Typography variant="h4" gutterBottom>
                {fullName}
              </Typography>
              <Typography variant="body1" color="text.secondary" gutterBottom>
                @{user.username}
              </Typography>

              {isOwnProfile && (
                <Button
                  variant="outlined"
                  startIcon={<Edit />}
                  onClick={() => navigate('/profile/edit')}
                  sx={{ mt: 2 }}
                >
                  Редактировать профиль
                </Button>
              )}
            </Box>
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Информация о пользователе */}
          <Grid container spacing={3}>
            {user.bio && (
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  О себе
                </Typography>
                <Typography variant="body1">{user.bio}</Typography>
              </Grid>
            )}

            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Email color="action" />
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Email
                  </Typography>
                  <Typography variant="body2">{user.email}</Typography>
                </Box>
              </Box>
            </Grid>

            {user.phone && (
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Phone color="action" />
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Телефон
                    </Typography>
                    <Typography variant="body2">{user.phone}</Typography>
                  </Box>
                </Box>
              </Grid>
            )}

            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CalendarToday color="action" />
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Дата регистрации
                  </Typography>
                  <Typography variant="body2">
                    {new Date(user.createdAt).toLocaleDateString('ru-RU')}
                  </Typography>
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Статус
                </Typography>
                <Typography variant="body2" color={user.isOnline ? 'success.main' : 'text.secondary'}>
                  {user.isOnline
                    ? 'Онлайн'
                    : `Был(а) в сети ${new Date(user.lastSeen).toLocaleString('ru-RU')}`}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </Box>
    </Container>
  );
};
