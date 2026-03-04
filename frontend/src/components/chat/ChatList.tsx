import { useEffect } from 'react';
import { Box, List, Typography, CircularProgress } from '@mui/material';
import { ChatListItem } from './ChatListItem';
import { useChatStore } from '../../store/chatStore';

interface ChatListProps {
  onChatSelect: (chatId: string) => void;
  selectedChatId: string | null;
}

export const ChatList = ({ onChatSelect, selectedChatId }: ChatListProps) => {
  const { chats, isLoading, loadChats } = useChatStore();

  useEffect(() => {
    loadChats();
  }, [loadChats]);

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

  if (chats.length === 0) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          p: 3,
        }}
      >
        <Typography variant="body1" color="text.secondary" align="center">
          У вас пока нет чатов.
          <br />
          Начните общение!
        </Typography>
      </Box>
    );
  }

  return (
    <List sx={{ width: '100%', p: 1, overflowY: 'auto' }}>
      {chats.map((chat) => (
        <ChatListItem
          key={chat.id}
          chat={chat}
          isActive={chat.id === selectedChatId}
          onClick={() => onChatSelect(chat.id)}
        />
      ))}
    </List>
  );
};
