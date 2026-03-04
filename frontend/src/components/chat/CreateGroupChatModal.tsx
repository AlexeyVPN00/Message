import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
  Checkbox,
  CircularProgress,
  Typography,
} from '@mui/material';
import { usersApi } from '../../api/users.api';
import { useChatStore } from '../../store/chatStore';
import { User } from '../../types/user.types';
import { Avatar } from '../common/Avatar';
import toast from 'react-hot-toast';

interface CreateGroupChatModalProps {
  open: boolean;
  onClose: () => void;
  onCreated?: (chatId: string) => void;
}

export const CreateGroupChatModal = ({ open, onClose, onCreated }: CreateGroupChatModalProps) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  const { createGroupChat } = useChatStore();

  useEffect(() => {
    if (!open) {
      // Reset form when modal closes
      setName('');
      setDescription('');
      setSearchQuery('');
      setSelectedUserIds(new Set());
    }
  }, [open]);

  useEffect(() => {
    const searchUsers = async () => {
      if (!open) return;

      try {
        setLoading(true);
        const result = await usersApi.searchUsers({ search: searchQuery, limit: 20 });
        setUsers(result.users);
      } catch (error) {
        console.error('Error searching users:', error);
        toast.error('Ошибка при поиске пользователей');
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(searchUsers, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery, open]);

  const handleToggleUser = (userId: string) => {
    setSelectedUserIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(userId)) {
        newSet.delete(userId);
      } else {
        newSet.add(userId);
      }
      return newSet;
    });
  };

  const handleCreate = async () => {
    if (!name.trim()) {
      toast.error('Введите название группы');
      return;
    }

    if (selectedUserIds.size === 0) {
      toast.error('Добавьте хотя бы одного участника');
      return;
    }

    try {
      setCreating(true);
      const chat = await createGroupChat(
        name.trim(),
        description.trim() || undefined,
        Array.from(selectedUserIds)
      );

      if (chat) {
        onCreated?.(chat.id);
        onClose();
      }
    } catch (error) {
      console.error('Error creating group:', error);
    } finally {
      setCreating(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Создать группу</DialogTitle>

      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField
            fullWidth
            label="Название группы"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoFocus
          />

          <TextField
            fullWidth
            label="Описание (необязательно)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            multiline
            rows={2}
          />

          <TextField
            fullWidth
            label="Поиск пользователей"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Введите имя или username..."
          />

          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Выбрано участников: {selectedUserIds.size}
            </Typography>

            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                <CircularProgress size={24} />
              </Box>
            ) : (
              <List
                sx={{
                  maxHeight: 300,
                  overflow: 'auto',
                  border: 1,
                  borderColor: 'divider',
                  borderRadius: 1,
                }}
              >
                {users.length === 0 ? (
                  <Box sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      {searchQuery ? 'Пользователи не найдены' : 'Начните поиск пользователей'}
                    </Typography>
                  </Box>
                ) : (
                  users.map((user) => (
                    <ListItem key={user.id} disablePadding>
                      <ListItemButton onClick={() => handleToggleUser(user.id)}>
                        <Checkbox
                          edge="start"
                          checked={selectedUserIds.has(user.id)}
                          tabIndex={-1}
                          disableRipple
                        />
                        <ListItemAvatar>
                          <Avatar src={user.avatarUrl} alt={user.username} size={40} />
                        </ListItemAvatar>
                        <ListItemText
                          primary={user.username}
                          secondary={
                            user.firstName || user.lastName
                              ? `${user.firstName || ''} ${user.lastName || ''}`.trim()
                              : undefined
                          }
                        />
                      </ListItemButton>
                    </ListItem>
                  ))
                )}
              </List>
            )}
          </Box>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={creating}>
          Отмена
        </Button>
        <Button
          onClick={handleCreate}
          variant="contained"
          disabled={creating || !name.trim() || selectedUserIds.size === 0}
        >
          {creating ? <CircularProgress size={24} /> : 'Создать'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
