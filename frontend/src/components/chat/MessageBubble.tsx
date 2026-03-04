import { Box, Typography, Paper } from '@mui/material';
import { Message } from '../../types/chat.types';
import { useAuthStore } from '../../store/authStore';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';

interface MessageBubbleProps {
  message: Message;
}

export const MessageBubble = ({ message }: MessageBubbleProps) => {
  const { user } = useAuthStore();
  const isOwnMessage = message.senderId === user?.id;

  const timeAgo = formatDistanceToNow(new Date(message.createdAt), {
    addSuffix: true,
    locale: ru,
  });

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: isOwnMessage ? 'flex-end' : 'flex-start',
        mb: 1,
      }}
    >
      <Paper
        elevation={1}
        sx={{
          maxWidth: '70%',
          px: 2,
          py: 1,
          bgcolor: isOwnMessage ? 'primary.main' : 'background.paper',
          color: isOwnMessage ? 'primary.contrastText' : 'text.primary',
          borderRadius: 2,
          borderTopRightRadius: isOwnMessage ? 0 : 16,
          borderTopLeftRadius: isOwnMessage ? 16 : 0,
        }}
      >
        {!isOwnMessage && (
          <Typography variant="caption" sx={{ fontWeight: 600, display: 'block', mb: 0.5 }}>
            {message.sender.username}
          </Typography>
        )}

        {message.replyToMessage && (
          <Box
            sx={{
              borderLeft: 3,
              borderColor: isOwnMessage ? 'rgba(255,255,255,0.5)' : 'primary.main',
              pl: 1,
              mb: 1,
              opacity: 0.7,
            }}
          >
            <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>
              {message.replyToMessage.sender.username}
            </Typography>
            <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
              {message.replyToMessage.content}
            </Typography>
          </Box>
        )}

        <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
          {message.content}
        </Typography>

        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mt: 0.5,
            gap: 1,
          }}
        >
          <Typography
            variant="caption"
            sx={{
              fontSize: '0.65rem',
              opacity: 0.7,
            }}
          >
            {timeAgo}
            {message.isEdited && ' (изменено)'}
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};
