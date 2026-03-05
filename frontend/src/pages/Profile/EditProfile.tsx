import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  CircularProgress,
  IconButton,
  Stack,
} from '@mui/material';
import { PhotoCamera, Delete, ArrowBack } from '@mui/icons-material';
import { useAuthStore } from '../../store/authStore';
import { usersApi } from '../../api/users.api';
import { uploadApi } from '../../api/upload.api';
import { Avatar } from '../../components/common/Avatar';
import { MainLayout } from '../../layouts/MainLayout';
import { ImageCropModal } from '../../components/common/ImageCropModal';
import toast from 'react-hot-toast';

export const EditProfile = () => {
  const navigate = useNavigate();
  const { user, setUser } = useAuthStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    bio: user?.bio || '',
    phone: user?.phone || '',
  });

  const [loading, setLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string>('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) return;

    try {
      setLoading(true);
      const updatedUser = await usersApi.updateUser(user.id, formData);
      setUser(updatedUser);
      toast.success('Профиль успешно обновлен');
      navigate('/profile');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Ошибка при обновлении профиля');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Проверка типа файла
    if (!file.type.startsWith('image/')) {
      toast.error('Пожалуйста, выберите изображение');
      return;
    }

    // Проверка размера (макс 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Размер файла не должен превышать 10MB');
      return;
    }

    // Создать URL для превью изображения
    const imageUrl = URL.createObjectURL(file);
    setSelectedImageUrl(imageUrl);
    setCropModalOpen(true);

    // Очистить input для повторного выбора того же файла
    e.target.value = '';
  };

  const handleCropComplete = async (croppedImageBlob: Blob) => {
    if (!user) return;

    try {
      setUploadingAvatar(true);
      setCropModalOpen(false);

      // Создать File из Blob
      const file = new File([croppedImageBlob], 'avatar.jpg', { type: 'image/jpeg' });

      const response = await uploadApi.uploadAvatar(file);
      setUser(response.user);
      toast.success('Аватар успешно загружен');
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast.error('Ошибка при загрузке аватара');
    } finally {
      setUploadingAvatar(false);
      // Освободить URL
      URL.revokeObjectURL(selectedImageUrl);
      setSelectedImageUrl('');
    }
  };

  const handleCropCancel = () => {
    setCropModalOpen(false);
    // Освободить URL
    URL.revokeObjectURL(selectedImageUrl);
    setSelectedImageUrl('');
  };

  const handleDeleteAvatar = async () => {
    if (!user) return;

    try {
      setUploadingAvatar(true);
      const updatedUser = await usersApi.deleteAvatar(user.id);
      setUser(updatedUser);
      toast.success('Аватар удален');
    } catch (error) {
      console.error('Error deleting avatar:', error);
      toast.error('Ошибка при удалении аватара');
    } finally {
      setUploadingAvatar(false);
    }
  };

  if (!user) {
    return (
      <Container maxWidth="sm">
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

  const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ') || user.username;

  return (
    <MainLayout>
      <Container maxWidth="sm">
        <Box sx={{ py: 4 }}>
          <Button startIcon={<ArrowBack />} onClick={() => navigate('/profile')} sx={{ mb: 2 }}>
            Назад к профилю
          </Button>

          <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Редактирование профиля
          </Typography>

          {/* Аватар */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2,
              my: 3,
            }}
          >
            <Box sx={{ position: 'relative' }}>
              <Avatar src={user.avatarUrl || undefined} alt={fullName} size={120} />
              {uploadingAvatar && (
                <CircularProgress
                  size={120}
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                  }}
                />
              )}
            </Box>

            <Stack direction="row" spacing={2}>
              <Button
                variant="outlined"
                startIcon={<PhotoCamera />}
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingAvatar}
              >
                Загрузить фото
              </Button>

              {user.avatarUrl && (
                <IconButton
                  color="error"
                  onClick={handleDeleteAvatar}
                  disabled={uploadingAvatar}
                  title="Удалить аватар"
                >
                  <Delete />
                </IconButton>
              )}
            </Stack>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleAvatarChange}
            />
          </Box>

          {/* Форма */}
          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Имя"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              margin="normal"
            />

            <TextField
              fullWidth
              label="Фамилия"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              margin="normal"
            />

            <TextField
              fullWidth
              label="О себе"
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              margin="normal"
              multiline
              rows={4}
              placeholder="Расскажите о себе..."
            />

            <TextField
              fullWidth
              label="Телефон"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              margin="normal"
              placeholder="+7 (999) 123-45-67"
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{ mt: 3 }}
            >
              {loading ? <CircularProgress size={24} /> : 'Сохранить изменения'}
            </Button>
          </Box>
        </Paper>
      </Box>

      {/* Модальное окно кадрирования */}
      <ImageCropModal
        open={cropModalOpen}
        imageUrl={selectedImageUrl}
        onClose={handleCropCancel}
        onCropComplete={handleCropComplete}
        aspectRatio={1}
      />
    </Container>
    </MainLayout>
  );
};
