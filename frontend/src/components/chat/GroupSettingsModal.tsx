import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Avatar,
  IconButton,
  Typography,
} from '@mui/material';
import { PhotoCamera, Close } from '@mui/icons-material';
import { useChatStore } from '../../store/chatStore';
import { Chat } from '../../types/chat.types';
import toast from 'react-hot-toast';

interface GroupSettingsModalProps {
  open: boolean;
  onClose: () => void;
  chat: Chat;
}

export const GroupSettingsModal = ({ open, onClose, chat }: GroupSettingsModalProps) => {
  const { updateGroupChat } = useChatStore();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (chat) {
      setName(chat.name || '');
      setDescription(chat.description || '');
      setAvatarPreview(chat.avatarUrl);
    }
  }, [chat]);

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Размер файла не должен превышать 5MB');
        return;
      }

      if (!file.type.startsWith('image/')) {
        toast.error('Можно загружать только изображения');
        return;
      }

      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error('Название группы обязательно');
      return;
    }

    setLoading(true);
    try {
      // TODO: Implement avatar upload when upload API is ready
      await updateGroupChat(chat.id, {
        name: name.trim(),
        description: description.trim() || undefined,
        avatarUrl: avatarPreview,
      });
      onClose();
    } catch (error) {
      console.error('Error updating group:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
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
              src={avatarPreview}
              sx={{ width: 100, height: 100 }}
            >
              {name.charAt(0).toUpperCase()}
            </Avatar>
            <Button
              component="label"
              variant="outlined"
              startIcon={<PhotoCamera />}
              size="small"
            >
              Изменить фото
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={handleAvatarChange}
              />
            </Button>
            {avatarFile && (
              <Typography variant="caption" color="text.secondary">
                {avatarFile.name}
              </Typography>
            )}
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
  );
};
