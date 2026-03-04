import { Box, ListItem, ListItemButton, ListItemAvatar, ListItemText, Badge, Typography } from '@mui/material';
import { Chat, ChatType } from '../../types/chat.types';
import { Avatar } from '../common/Avatar';
import { useAuthStore } from '../../store/authStore';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';

interface ChatListItemProps {
  chat: Chat;
  isActive: boolean;
  onClick: () => void;
}

export const ChatListItem = ({ chat, isActive, onClick }: ChatListItemProps) => {
  const { user } = useAuthStore();

  // Для приватных чатов получаем собеседника
  const getOtherUser = () => {
    if (chat.type === ChatType.PRIVATE) {
      return chat.members.find((m) => m.userId !== user?.id)?.user;
    }
    return null;
  };

  const otherUser = getOtherUser();
  const chatName = chat.type === ChatType.PRIVATE ? otherUser?.username || 'Неизвестный' : chat.name || 'Группа';
  const avatarUrl = chat.type === ChatType.PRIVATE ? otherUser?.avatarUrl : chat.avatarUrl;
  const isOnline = chat.type === ChatType.PRIVATE ? otherUser?.isOnline : false;

  const lastMessageTime = chat.lastMessage
    ? formatDistanceToNow(new Date(chat.lastMessage.createdAt), {
        addSuffix: true,
        locale: ru,
      })
    : null;

  const lastMessagePreview = chat.lastMessage
    ? chat.lastMessage.senderId === user?.id
      ? `Вы: ${chat.lastMessage.content}`
      : chat.lastMessage.content
    : 'Нет сообщений';

  return (
    <ListItem disablePadding>
      <ListItemButton
        onClick={onClick}
        selected={isActive}
        sx={{
          borderRadius: 1,
          mb: 0.5,
          '&.Mui-selected': {
            bgcolor: 'action.selected',
          },
        }}
      >
        <ListItemAvatar>
          <Badge
            overlap="circular"
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            variant="dot"
            sx={{
              '& .MuiBadge-badge': {
                display: chat.type === ChatType.PRIVATE && isOnline ? 'block' : 'none',
                backgroundColor: '#44b700',
                color: '#44b700',
                boxShadow: (theme) => `0 0 0 2px ${theme.palette.background.paper}`,
              },
            }}
          >
            <Avatar src={avatarUrl} alt={chatName} size={48} />
          </Badge>
        </ListItemAvatar>

        <ListItemText
          primary={
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                {chatName}
              </Typography>
              {lastMessageTime && (
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                  {lastMessageTime}
                </Typography>
              )}
            </Box>
          }
          secondary={
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  fontSize: '0.85rem',
                }}
              >
                {lastMessagePreview}
              </Typography>
              {chat.unreadCount && chat.unreadCount > 0 && (
                <Badge
                  badgeContent={chat.unreadCount}
                  color="primary"
                  sx={{
                    ml: 1,
                    '& .MuiBadge-badge': {
                      fontSize: '0.7rem',
                      height: 18,
                      minWidth: 18,
                    },
                  }}
                />
              )}
            </Box>
          }
        />
      </ListItemButton>
    </ListItem>
  );
};
