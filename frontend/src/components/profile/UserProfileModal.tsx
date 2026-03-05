import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  IconButton,
  Typography,
  Button,
  Divider,
} from '@mui/material';
import { Close, Message, Phone, Email, PersonAdd, PersonRemove } from '@mui/icons-material';
import { Avatar } from '../common/Avatar';
import { User } from '../../types/user.types';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';
import { contactsApi } from '../../api/contacts.api';
import toast from 'react-hot-toast';

interface UserProfileModalProps {
  open: boolean;
  onClose: () => void;
  user: User;
  onStartChat?: () => void;
}

export const UserProfileModal = ({ open, onClose, user, onStartChat }: UserProfileModalProps) => {
  const [isContact, setIsContact] = useState(false);
  const [isLoadingContact, setIsLoadingContact] = useState(false);

  const lastSeenText = user.isOnline
    ? 'В сети'
    : `Был(а) ${formatDistanceToNow(new Date(user.lastSeen), { addSuffix: true, locale: ru })}`;

  // Проверяем, находится ли пользователь в контактах
  useEffect(() => {
    const checkContact = async () => {
      try {
        const result = await contactsApi.checkContact(user.id);
        setIsContact(result);
      } catch (error) {
        console.error('Error checking contact:', error);
      }
    };

    if (open) {
      checkContact();
    }
  }, [user.id, open]);

  const handleToggleContact = async () => {
    setIsLoadingContact(true);
    try {
      if (isContact) {
        await contactsApi.removeContact(user.id);
        setIsContact(false);
        toast.success('Контакт удален');
      } else {
        await contactsApi.addContact(user.id);
        setIsContact(true);
        toast.success('Контакт добавлен');
      }
    } catch (error) {
      console.error('Error toggling contact:', error);
      toast.error('Ошибка при обновлении контакта');
    } finally {
      setIsLoadingContact(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <IconButton
          onClick={onClose}
          sx={{ position: 'absolute', right: 8, top: 8 }}
        >
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, pb: 2 }}>
          {/* Аватар и основная информация */}
          <Avatar
            src={user.avatarUrl || undefined}
            alt={user.username}
            size={120}
            online={user.isOnline}
          />

          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>
              {user.firstName || user.lastName
                ? `${user.firstName || ''} ${user.lastName || ''}`.trim()
                : user.username}
            </Typography>
            <Typography variant="body2" color="primary" sx={{ mb: 0.5 }}>
              @{user.username}
            </Typography>
            <Typography variant="caption" color={user.isOnline ? 'success.main' : 'text.secondary'}>
              {lastSeenText}
            </Typography>
          </Box>

          {/* Био */}
          {user.bio && (
            <Box sx={{ width: '100%', textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                {user.bio}
              </Typography>
            </Box>
          )}

          <Divider sx={{ width: '100%', my: 1 }} />

          {/* Контактная информация */}
          <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
            {user.email && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Email color="action" />
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Email
                  </Typography>
                  <Typography variant="body2">{user.email}</Typography>
                </Box>
              </Box>
            )}

            {user.phone && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Phone color="action" />
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Телефон
                  </Typography>
                  <Typography variant="body2">{user.phone}</Typography>
                </Box>
              </Box>
            )}

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="caption" color="text.secondary">
                ID пользователя
              </Typography>
              <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                {user.id}
              </Typography>
            </Box>
          </Box>

          {/* Кнопки действий */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, width: '100%', mt: 2 }}>
            {/* Кнопка добавления/удаления из контактов */}
            <Button
              variant={isContact ? 'outlined' : 'contained'}
              color={isContact ? 'error' : 'primary'}
              startIcon={isContact ? <PersonRemove /> : <PersonAdd />}
              onClick={handleToggleContact}
              disabled={isLoadingContact}
              fullWidth
            >
              {isContact ? 'Удалить из контактов' : 'Добавить в контакты'}
            </Button>

            {/* Кнопка "Написать сообщение" */}
            {onStartChat && (
              <Button
                variant="contained"
                startIcon={<Message />}
                onClick={() => {
                  onStartChat();
                  onClose();
                }}
                fullWidth
              >
                Написать сообщение
              </Button>
            )}
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};
