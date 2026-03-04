import { Card, CardContent, CardActions, Typography, Button, Box, Chip } from '@mui/material';
import { People, Lock } from '@mui/icons-material';
import { Channel } from '../../types/channel.types';
import { Avatar } from '../common/Avatar';
import { useNavigate } from 'react-router-dom';

interface ChannelCardProps {
  channel: Channel;
  onSubscribe?: (channelId: string) => void;
  onUnsubscribe?: (channelId: string) => void;
}

export const ChannelCard = ({ channel, onSubscribe, onUnsubscribe }: ChannelCardProps) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/channels/${channel.id}`);
  };

  const handleSubscribeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (channel.isSubscribed && onUnsubscribe) {
      onUnsubscribe(channel.id);
    } else if (!channel.isSubscribed && onSubscribe) {
      onSubscribe(channel.id);
    }
  };

  return (
    <Card
      sx={{
        cursor: 'pointer',
        '&:hover': {
          boxShadow: 3,
        },
        transition: 'box-shadow 0.2s',
      }}
      onClick={handleCardClick}
    >
      <CardContent>
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <Avatar src={channel.avatarUrl} alt={channel.name} size={56} />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
              <Typography variant="h6" noWrap>
                {channel.name}
              </Typography>
              {channel.isPrivate && (
                <Lock fontSize="small" color="action" />
              )}
            </Box>
            <Typography variant="caption" color="text.secondary">
              @{channel.owner.username}
            </Typography>
          </Box>
        </Box>

        {channel.description && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mb: 2,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
            }}
          >
            {channel.description}
          </Typography>
        )}

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <People fontSize="small" color="action" />
          <Typography variant="caption" color="text.secondary">
            {channel.subscribersCount} подписчиков
          </Typography>
        </Box>
      </CardContent>

      <CardActions>
        <Button
          size="small"
          variant={channel.isSubscribed ? 'outlined' : 'contained'}
          onClick={handleSubscribeClick}
          fullWidth
        >
          {channel.isSubscribed ? 'Отписаться' : 'Подписаться'}
        </Button>
      </CardActions>
    </Card>
  );
};
