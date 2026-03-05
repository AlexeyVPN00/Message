import { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  IconButton,
  CircularProgress,
} from '@mui/material';
import { PhotoCamera, Close } from '@mui/icons-material';
import { useChatStore } from '../../store/chatStore';
import { Chat } from '../../types/chat.types';
import { ImageCropModal } from '../common/ImageCropModal';
import { Avatar } from '../common/Avatar';
import { chatsApi } from '../../api/chats.api';
import toast from 'react-hot-toast';

interface GroupSettingsModalProps {
  open: boolean;
  onClose: () => void;
  chat: Chat;
}

export const GroupSettingsModal = ({ open, onClose, chat }: GroupSettingsModalProps) => {
  const { updateGroupChat } = useChatStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string>('');

  useEffect(() => {
    if (chat) {
      setName(chat.name || '');
      setDescription(chat.description || '');
      setAvatarUrl(chat.avatarUrl);
    }
  }, [chat]);

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Размер файла не должен превышать 10MB');
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast.error('Можно загружать только изображения');
      return;
    }

    // Создать URL для превью изображения
    const imageUrl = URL.createObjectURL(file);
    setSelectedImageUrl(imageUrl);
    setCropModalOpen(true);

    // Очистить input для повторного выбора того же файла
    event.target.value = '';
  };

  const handleCropComplete = async (croppedImageBlob: Blob) => {
    try {
      setUploadingAvatar(true);
      setCropModalOpen(false);

      // Создать File из Blob
      const file = new File([croppedImageBlob], 'group-avatar.jpg', { type: 'image/jpeg' });

      // Загрузить аватар на сервер
      const response = await chatsApi.uploadGroupAvatar(chat.id, file);
      setAvatarUrl(response.avatarUrl);
      toast.success('Аватар группы успешно обновлен');
    } catch (error) {
      console.error('Error uploading group avatar:', error);
      toast.error('Ошибка при загрузке аватара группы');
    } finally {
      setUploadingAvatar(false);
      URL.revokeObjectURL(selectedImageUrl);
      setSelectedImageUrl('');
    }
  };

  const handleCropCancel = () => {
    setCropModalOpen(false);
    URL.revokeObjectURL(selectedImageUrl);
    setSelectedImageUrl('');
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error('Название группы обязательно');
      return;
    }

    setLoading(true);
    try {
      await updateGroupChat(chat.id, {
        name: name.trim(),
        description: description.trim() || undefined,
        avatarUrl,
      });
      onClose();
    } catch (error) {
      console.error('Error updating group:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          Настройки группы
          <IconButton
            onClick={onClose}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <Close />
          </IconButton>
        </DialogTitle>

        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 1 }}>
            {/* Avatar */}
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
              <Avatar
                src={avatarUrl}
                alt={name || 'Group'}
                size={100}
              />
              <Button
                component="label"
                variant="outlined"
                startIcon={uploadingAvatar ? <CircularProgress size={20} /> : <PhotoCamera />}
                size="small"
                disabled={uploadingAvatar}
              >
                {uploadingAvatar ? 'Загрузка...' : 'Изменить фото'}
                <input
                  ref={fileInputRef}
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleAvatarChange}
                />
              </Button>
            </Box>

            {/* Name */}
            <TextField
              label="Название группы"
              value={name}
              onChange={(e) => setName(e.target.value)}
              fullWidth
              required
              inputProps={{ maxLength: 100 }}
              helperText={`${name.length}/100`}
            />

            {/* Description */}
            <TextField
              label="Описание"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              fullWidth
              multiline
              rows={3}
              inputProps={{ maxLength: 500 }}
              helperText={`${description.length}/500`}
            />
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose} disabled={loading}>
            Отмена
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={loading || !name.trim()}
          >
            {loading ? 'Сохранение...' : 'Сохранить'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Image Crop Modal */}
      <ImageCropModal
        open={cropModalOpen}
        imageUrl={selectedImageUrl}
        onClose={handleCropCancel}
        onCropComplete={handleCropComplete}
        aspectRatio={1}
      />
    </>
  );
};
