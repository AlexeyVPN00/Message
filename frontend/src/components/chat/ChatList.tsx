import { useEffect, useState, useMemo } from 'react';
import {
  Box,
  List,
  Typography,
  CircularProgress,
  TextField,
  InputAdornment,
  ListItem,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
  Divider,
} from '@mui/material';
import { Search, PersonAdd } from '@mui/icons-material';
import { ChatListItem } from './ChatListItem';
import { Avatar } from '../common/Avatar';
import { useChatStore } from '../../store/chatStore';
import { useAuthStore } from '../../store/authStore';
import { usersApi } from '../../api/users.api';
import { User } from '../../types/user.types';
import { ChatType } from '../../types/chat.types';

interface ChatListProps {
  onChatSelect: (chatId: string) => void;
  selectedChatId: string | null;
}

export const ChatList = ({ onChatSelect, selectedChatId }: ChatListProps) => {
  const { chats, isLoading, loadChats, createPrivateChat } = useChatStore();
  const { user: currentUser } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    loadChats();
  }, [loadChats]);

  // Поиск пользователей по username
  useEffect(() => {
    const searchUsers = async () => {
      if (searchQuery.trim().length === 0) {
        setSearchResults([]);
        return;
      }

      // Если запрос начинается с @, убираем @
      const query = searchQuery.startsWith('@') ? searchQuery.slice(1) : searchQuery;

      if (query.length < 2) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      try {
        const response = await usersApi.searchUsers({ search: query, limit: 10 });
        // Исключаем текущего пользователя из результатов
        const filteredUsers = response.users.filter((u) => u.id !== currentUser?.id);
        setSearchResults(filteredUsers);
      } catch (error) {
        console.error('Error searching users:', error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    };

    const timeoutId = setTimeout(searchUsers, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery, currentUser?.id]);

  // Фильтрация существующих чатов
  const filteredChats = useMemo(() => {
    if (!searchQuery.trim()) return chats;

    const query = searchQuery.toLowerCase();
    return chats.filter((chat) => {
      // Для приватных чатов ищем по username собеседника
      if (chat.type === ChatType.PRIVATE) {
        const otherUser = chat.members.find((m) => m.userId !== currentUser?.id)?.user;
        return otherUser?.username.toLowerCase().includes(query);
      }
      // Для групповых чатов ищем по названию
      return chat.name?.toLowerCase().includes(query);
    });
  }, [chats, searchQuery, currentUser?.id]);

  const handleUserClick = async (user: User) => {
    try {
      // Проверяем, есть ли уже чат с этим пользователем
      const existingChat = chats.find(
        (c) =>
          c.type === ChatType.PRIVATE &&
          c.members.some((m) => m.userId === user.id)
      );

      if (existingChat) {
        onChatSelect(existingChat.id);
        setSearchQuery('');
        return;
      }

      // Создаем новый чат
      const newChat = await createPrivateChat(user.id);
      if (newChat) {
        onChatSelect(newChat.id);
        setSearchQuery('');
      }
    } catch (error) {
      console.error('Error creating chat:', error);
    }
  };

  if (isLoading && chats.length === 0) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  const showSearchResults = searchQuery.trim().length > 0 && searchResults.length > 0;
  const showNoResults = searchQuery.trim().length > 0 && !isSearching && searchResults.length === 0 && filteredChats.length === 0;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Поле поиска */}
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Поиск чатов или @username..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {/* Результаты поиска пользователей */}
      {showSearchResults && (
        <>
          <Box sx={{ px: 2, py: 1, bgcolor: 'action.hover' }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
              НАЙДЕННЫЕ ПОЛЬЗОВАТЕЛИ
            </Typography>
          </Box>
          <List sx={{ pt: 0 }}>
            {searchResults.map((user) => (
              <ListItem key={user.id} disablePadding>
                <ListItemButton onClick={() => handleUserClick(user)}>
                  <ListItemAvatar>
                    <Avatar src={user.avatarUrl || undefined} alt={user.username} size={40} />
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Typography variant="subtitle2">
                        @{user.username}
                      </Typography>
                    }
                    secondary={
                      user.firstName || user.lastName
                        ? `${user.firstName || ''} ${user.lastName || ''}`.trim()
                        : 'Нет имени'
                    }
                  />
                  <PersonAdd sx={{ color: 'action.active' }} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
          {filteredChats.length > 0 && <Divider />}
        </>
      )}

      {/* Список чатов */}
      {filteredChats.length > 0 && (
        <>
          {showSearchResults && (
            <Box sx={{ px: 2, py: 1, bgcolor: 'action.hover' }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                ВАШИ ЧАТЫ
              </Typography>
            </Box>
          )}
          <List sx={{ flex: 1, overflowY: 'auto', p: 1 }}>
            {filteredChats.map((chat) => (
              <ChatListItem
                key={chat.id}
                chat={chat}
                isActive={chat.id === selectedChatId}
                onClick={() => {
                  onChatSelect(chat.id);
                  setSearchQuery('');
                }}
              />
            ))}
          </List>
        </>
      )}

      {/* Нет результатов */}
      {showNoResults && (
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: 3,
          }}
        >
          <Typography variant="body2" color="text.secondary" align="center">
            Ничего не найдено
            <br />
            <Typography variant="caption" color="text.secondary">
              Попробуйте изменить запрос
            </Typography>
          </Typography>
        </Box>
      )}

      {/* Нет чатов */}
      {!searchQuery && chats.length === 0 && (
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: 3,
          }}
        >
          <Typography variant="body1" color="text.secondary" align="center">
            У вас пока нет чатов.
            <br />
            Найдите собеседника по @username
          </Typography>
        </Box>
      )}

      {/* Индикатор загрузки поиска */}
      {isSearching && (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
          <CircularProgress size={24} />
        </Box>
      )}
    </Box>
  );
};
