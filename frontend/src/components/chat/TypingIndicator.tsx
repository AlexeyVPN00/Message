import { Box, Typography } from '@mui/material';
import { TypingUser } from '../../types/chat.types';

interface TypingIndicatorProps {
  typingUsers: TypingUser[];
}

export const TypingIndicator = ({ typingUsers }: TypingIndicatorProps) => {
  if (typingUsers.length === 0) {
    return null;
  }

  const getText = () => {
    if (typingUsers.length === 1) {
      return `${typingUsers[0].username} печатает...`;
    } else if (typingUsers.length === 2) {
      return `${typingUsers[0].username} и ${typingUsers[1].username} печатают...`;
    } else {
      return `${typingUsers.length} пользователя печатают...`;
    }
  };

  return (
    <Box sx={{ px: 2, py: 1 }}>
      <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
        {getText()}
        <Box
          component="span"
          sx={{
            display: 'inline-block',
            ml: 0.5,
            animation: 'blink 1.4s infinite',
            '@keyframes blink': {
              '0%, 100%': { opacity: 0 },
              '50%': { opacity: 1 },
            },
          }}
        >
          ●●●
        </Box>
      </Typography>
    </Box>
  );
};
