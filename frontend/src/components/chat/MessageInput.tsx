import { useState, useRef, useEffect } from 'react';
import { Box, TextField, IconButton, Paper } from '@mui/material';
import { Send } from '@mui/icons-material';
import { useChatStore } from '../../store/chatStore';

interface MessageInputProps {
  chatId: string;
}

export const MessageInput = ({ chatId }: MessageInputProps) => {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef<number | null>(null);

  const { sendMessage, emitTyping, emitStopTyping } = useChatStore();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);

    // Отправляем событие "печатает"
    if (!isTyping) {
      setIsTyping(true);
      emitTyping(chatId);
    }

    // Сбрасываем таймер
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Отправляем "прекратил печатать" через 2 секунды после последнего ввода
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      emitStopTyping(chatId);
    }, 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (message.trim().length === 0) {
      return;
    }

    sendMessage(chatId, message.trim());
    setMessage('');

    // Останавливаем индикатор "печатает"
    if (isTyping) {
      setIsTyping(false);
      emitStopTyping(chatId);
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Cleanup при размонтировании
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (isTyping) {
        emitStopTyping(chatId);
      }
    };
  }, [chatId, isTyping, emitStopTyping]);

  return (
    <Box
      sx={{
        borderTop: 1,
        borderColor: 'divider',
        display: 'flex',
        justifyContent: 'center',
        bgcolor: 'background.paper',
      }}
    >
      <Paper
        component="form"
        onSubmit={handleSubmit}
        elevation={0}
        sx={{
          width: '100%',
          maxWidth: '900px',
          p: 2,
          display: 'flex',
          alignItems: 'flex-end',
          gap: 1,
        }}
      >
        <TextField
          fullWidth
          multiline
          maxRows={4}
          placeholder="Напишите сообщение..."
          value={message}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          variant="outlined"
          size="small"
        />

        <IconButton
          type="submit"
          color="primary"
          disabled={message.trim().length === 0}
          sx={{ mb: 0.5 }}
        >
          <Send />
        </IconButton>
      </Paper>
    </Box>
  );
};
