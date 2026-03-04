import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  IconButton,
  MenuItem,
  Select,
  TextField,
  Box,
  Typography,
  Chip,
  Divider,
} from '@mui/material';
import { Close, PersonAdd, PersonRemove } from '@mui/icons-material';
import { Avatar } from '../common/Avatar';
import { chatsApi } from '../../api/chats.api';
import { usersApi } from '../../api/users.api';
import { ChatMember, MemberRole, Chat } from '../../types/chat.types';
import { User } from '../../types/user.types';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';

interface MembersManagementModalProps {
  open: boolean;
  onClose: () => void;
  chat: Chat;
  onMembersChanged: () => void;
}

export const MembersManagementModal = ({
  open,
  onClose,
  chat,
  onMembersChanged,
}: MembersManagementModalProps) => {
  const { user: currentUser } = useAuthStore();
  const [members, setMembers] = useState<ChatMember[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddUser, setShowAddUser] = useState(false);

  const currentUserMember = members.find((m) => m.userId === currentUser?.id);
  const isOwner = currentUserMember?.role === MemberRole.OWNER;
  const isAdmin = currentUserMember?.role === MemberRole.ADMIN;
  const canManage = isOwner || isAdmin;

  useEffect(() => {
    if (open && chat) {
      loadMembers();
    }
  }, [open, chat]);

  useEffect(() => {
    if (searchQuery.trim().length >= 2) {
      searchUsers();
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const loadMembers = async () => {
    try {
      setLoading(true);
      const data = await chatsApi.getChatMembers(chat.id);
      setMembers(data);
    } catch (error) {
      console.error('Error loading members:', error);
      toast.error('Ошибка при загрузке участников');
    } finally {
      setLoading(false);
    }
  };

  const searchUsers = async () => {
    try {
      const users = await usersApi.searchUsers(searchQuery);
      // Фильтруем пользователей, которые уже в группе
      const memberIds = members.map((m) => m.userId);
      setSearchResults(users.filter((u) => !memberIds.includes(u.id)));
    } catch (error) {
      console.error('Error searching users:', error);
    }
  };

  const handleAddMember = async (userId: string) => {
    try {
      await chatsApi.addMember(chat.id, userId, MemberRole.MEMBER);
      toast.success('Участник добавлен');
      setSearchQuery('');
      setSearchResults([]);
      setShowAddUser(false);
      await loadMembers();
      onMembersChanged();
    } catch (error) {
      console.error('Error adding member:', error);
      toast.error('Ошибка при добавлении участника');
    }
  };

  const handleRemoveMember = async (userId: string) => {
    try {
      await chatsApi.removeMember(chat.id, userId);
      toast.success('Участник удален');
      await loadMembers();
      onMembersChanged();
    } catch (error) {
      console.error('Error removing member:', error);
      toast.error('Ошибка при удалении участника');
    }
  };

  const handleRoleChange = async (userId: string, newRole: MemberRole) => {
    try {
      await chatsApi.updateMemberRole(chat.id, userId, newRole);
      toast.success('Роль участника изменена');
      await loadMembers();
      onMembersChanged();
    } catch (error) {
      console.error('Error updating member role:', error);
      toast.error('Ошибка при изменении роли');
    }
  };

  const getRoleLabel = (role: MemberRole) => {
    switch (role) {
      case MemberRole.OWNER:
        return 'Владелец';
      case MemberRole.ADMIN:
        return 'Администратор';
      case MemberRole.MEMBER:
        return 'Участник';
      default:
        return role;
    }
  };

  const getRoleColor = (role: MemberRole) => {
    switch (role) {
      case MemberRole.OWNER:
        return 'error';
      case MemberRole.ADMIN:
        return 'primary';
      case MemberRole.MEMBER:
        return 'default';
      default:
        return 'default';
    }
  };

  const canRemoveMember = (member: ChatMember) => {
    if (!canManage) return false;
    if (member.role === MemberRole.OWNER) return false;
    if (isAdmin && member.role === MemberRole.ADMIN) return false;
    return true;
  };

  const canChangeRole = (member: ChatMember) => {
    if (!isOwner) return false;
    if (member.role === MemberRole.OWNER) return false;
    return true;
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Участники ({members.length})
        <IconButton onClick={onClose} sx={{ position: 'absolute', right: 8, top: 8 }}>
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        {/* Add Member Section */}
        {canManage && (
          <Box sx={{ mb: 2 }}>
            {showAddUser ? (
              <Box>
                <TextField
                  fullWidth
                  placeholder="Поиск пользователей..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                  size="small"
                />
                {searchResults.length > 0 && (
                  <List sx={{ maxHeight: 200, overflow: 'auto', mt: 1 }}>
                    {searchResults.map((user) => (
                      <ListItem
                        key={user.id}
                        secondaryAction={
                          <Button
                            size="small"
                            onClick={() => handleAddMember(user.id)}
                          >
                            Добавить
                          </Button>
                        }
                      >
                        <ListItemAvatar>
                          <Avatar src={user.avatarUrl} alt={user.username} size={40} />
                        </ListItemAvatar>
                        <ListItemText
                          primary={user.username}
                          secondary={user.email}
                        />
                      </ListItem>
                    ))}
                  </List>
                )}
              </Box>
            ) : (
              <Button
                fullWidth
                variant="outlined"
                startIcon={<PersonAdd />}
                onClick={() => setShowAddUser(true)}
              >
                Добавить участника
              </Button>
            )}
          </Box>
        )}

        <Divider sx={{ mb: 2 }} />

        {/* Members List */}
        <List>
          {members.map((member) => (
            <ListItem
              key={member.id}
              secondaryAction={
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                  {canChangeRole(member) ? (
                    <Select
                      size="small"
                      value={member.role}
                      onChange={(e) =>
                        handleRoleChange(member.userId, e.target.value as MemberRole)
                      }
                      sx={{ minWidth: 140 }}
                    >
                      <MenuItem value={MemberRole.ADMIN}>Администратор</MenuItem>
                      <MenuItem value={MemberRole.MEMBER}>Участник</MenuItem>
                    </Select>
                  ) : (
                    <Chip
                      label={getRoleLabel(member.role)}
                      size="small"
                      color={getRoleColor(member.role) as any}
                    />
                  )}
                  {canRemoveMember(member) && (
                    <IconButton
                      edge="end"
                      onClick={() => handleRemoveMember(member.userId)}
                      color="error"
                      size="small"
                    >
                      <PersonRemove />
                    </IconButton>
                  )}
                </Box>
              }
            >
              <ListItemAvatar>
                <Avatar
                  src={member.user.avatarUrl}
                  alt={member.user.username}
                  size={40}
                  online={member.user.isOnline}
                />
              </ListItemAvatar>
              <ListItemText
                primary={member.user.username}
                secondary={
                  member.userId === currentUser?.id ? 'Вы' : member.user.email
                }
              />
            </ListItem>
          ))}
        </List>

        {loading && (
          <Typography align="center" color="text.secondary" sx={{ py: 2 }}>
            Загрузка...
          </Typography>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Закрыть</Button>
      </DialogActions>
    </Dialog>
  );
};
