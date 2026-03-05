import { useEffect, useRef } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { MessageBubble } from './MessageBubble';
import { TypingIndicator } from './TypingIndicator';
import { useChatStore } from '../../store/chatStore';

interface MessageListProps {
  chatId: string;
}

export const MessageList = ({ chatId }: MessageListProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { messages, typingUsers, isLoading, loadMessages } = useChatStore();

  const chatMessages = messages[chatId] || [];
  const typingInThisChat = typingUsers[chatId] || [];

  useEffect(() => {
    loadMessages(chatId);
  }, [chatId, loadMessages]);

  useEffect(() => {
    // Автопрокрутка к последнему сообщению
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, typingInThisChat]);

  if (isLoading && chatMessages.length === 0) {
    return (
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (chatMessages.length === 0) {
    return (
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography variant="body1" color="text.secondary">
          Нет сообщений. Начните переписку!
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        flex: 1,
        overflowY: 'auto',
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      <Box
        sx={{
          width: '100%',
          maxWidth: '900px',
          p: 3,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {chatMessages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}

        <TypingIndicator typingUsers={typingInThisChat} />

        <div ref={messagesEndRef} />
      </Box>
    </Box>
  );
};
