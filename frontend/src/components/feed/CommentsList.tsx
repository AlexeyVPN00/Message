import { Box, Typography, IconButton, Divider } from '@mui/material';
import { Delete } from '@mui/icons-material';
import { useFeedStore } from '../../store/feedStore';
import { useAuthStore } from '../../store/authStore';
import { Avatar } from '../common/Avatar';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

interface CommentsListProps {
  postId: string;
}

export const CommentsList = ({ postId }: CommentsListProps) => {
  const { user } = useAuthStore();
  const { comments, deleteComment } = useFeedStore();
  const postComments = comments[postId] || [];

  const handleDeleteComment = async (commentId: string) => {
    if (window.confirm('Удалить комментарий?')) {
      try {
        await deleteComment(commentId);
      } catch (error) {
        console.error('Error deleting comment:', error);
      }
    }
  };

  if (postComments.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
        Пока нет комментариев
      </Typography>
    );
  }

  return (
    <Box>
      <Divider sx={{ mb: 2 }} />
      {postComments.map((comment) => (
        <Box key={comment.id} sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <Avatar src={comment.author.avatarUrl} alt={comment.author.username} size={32} />
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <Box>
                  <Typography variant="subtitle2">{comment.author.username}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {format(new Date(comment.createdAt), 'dd MMM, HH:mm', { locale: ru })}
                  </Typography>
                </Box>
                {comment.authorId === user?.id && (
                  <IconButton
                    size="small"
                    onClick={() => handleDeleteComment(comment.id)}
                    color="error"
                  >
                    <Delete fontSize="small" />
                  </IconButton>
                )}
              </Box>
              <Typography variant="body2" sx={{ mt: 0.5, whiteSpace: 'pre-wrap' }}>
                {comment.content}
              </Typography>
            </Box>
          </Box>
        </Box>
      ))}
    </Box>
  );
};
