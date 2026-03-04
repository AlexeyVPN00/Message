import { Card, CardContent, Typography, Box, IconButton } from '@mui/material';
import { Visibility, Delete } from '@mui/icons-material';
import { ChannelPost } from '../../types/channel.types';
import { Avatar } from '../common/Avatar';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useAuthStore } from '../../store/authStore';

interface ChannelPostCardProps {
  post: ChannelPost;
  onDelete?: (postId: string) => void;
  isOwner?: boolean;
}

export const ChannelPostCard = ({ post, onDelete, isOwner }: ChannelPostCardProps) => {
  const { user } = useAuthStore();
  const canDelete = isOwner || post.authorId === user?.id;

  const handleDelete = () => {
    if (onDelete && canDelete) {
      onDelete(post.id);
    }
  };

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
            <Avatar src={post.author.avatarUrl} alt={post.author.username} size={40} />
            <Box>
              <Typography variant="subtitle2">{post.author.username}</Typography>
              <Typography variant="caption" color="text.secondary">
                {format(new Date(post.createdAt), 'dd MMMM yyyy, HH:mm', { locale: ru })}
              </Typography>
            </Box>
          </Box>
          {canDelete && (
            <IconButton size="small" onClick={handleDelete} color="error">
              <Delete fontSize="small" />
            </IconButton>
          )}
        </Box>

        <Typography
          variant="body1"
          sx={{
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}
        >
          {post.content}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
          <Visibility fontSize="small" color="action" />
          <Typography variant="caption" color="text.secondary">
            {post.viewsCount} просмотров
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};
