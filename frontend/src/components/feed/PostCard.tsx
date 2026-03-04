import { useState } from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Box,
  IconButton,
  Button,
  Collapse,
  TextField,
} from '@mui/material';
import {
  Favorite,
  FavoriteBorder,
  ChatBubbleOutline,
  Delete,
  Edit,
} from '@mui/icons-material';
import { Post } from '../../types/post.types';
import { Avatar } from '../common/Avatar';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useAuthStore } from '../../store/authStore';
import { useFeedStore } from '../../store/feedStore';
import { CommentsList } from './CommentsList';

interface PostCardProps {
  post: Post;
}

export const PostCard = ({ post }: PostCardProps) => {
  const { user } = useAuthStore();
  const { likePost, unlikePost, deletePost, loadPostComments } = useFeedStore();
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');

  const isAuthor = post.authorId === user?.id;
  const isLiked = post.isLiked || (post.likes && post.likes.length > 0);

  const handleLike = async () => {
    try {
      if (isLiked) {
        await unlikePost(post.id);
      } else {
        await likePost(post.id);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Вы уверены, что хотите удалить этот пост?')) {
      try {
        await deletePost(post.id);
      } catch (error) {
        console.error('Error deleting post:', error);
      }
    }
  };

  const handleShowComments = async () => {
    if (!showComments) {
      await loadPostComments(post.id);
    }
    setShowComments(!showComments);
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
          {isAuthor && (
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
            mb: 2,
          }}
        >
          {post.content}
        </Typography>
      </CardContent>

      <CardActions sx={{ justifyContent: 'space-between', px: 2 }}>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            size="small"
            startIcon={isLiked ? <Favorite /> : <FavoriteBorder />}
            onClick={handleLike}
            color={isLiked ? 'error' : 'inherit'}
          >
            {post.likesCount}
          </Button>
          <Button
            size="small"
            startIcon={<ChatBubbleOutline />}
            onClick={handleShowComments}
          >
            {post.commentsCount}
          </Button>
        </Box>
      </CardActions>

      <Collapse in={showComments} timeout="auto" unmountOnExit>
        <Box sx={{ px: 2, pb: 2 }}>
          <CommentsList postId={post.id} />
          <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
            <TextField
              size="small"
              fullWidth
              placeholder="Написать комментарий..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              multiline
              maxRows={3}
            />
            <Button
              variant="contained"
              size="small"
              disabled={!commentText.trim()}
              onClick={async () => {
                try {
                  const { createComment } = useFeedStore.getState();
                  await createComment(post.id, commentText);
                  setCommentText('');
                } catch (error) {
                  console.error('Error creating comment:', error);
                }
              }}
            >
              Отправить
            </Button>
          </Box>
        </Box>
      </Collapse>
    </Card>
  );
};
