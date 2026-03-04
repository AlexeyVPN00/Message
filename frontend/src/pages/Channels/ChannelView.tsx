import { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  AppBar,
  Toolbar,
  IconButton,
  Button,
  Paper,
  TextField,
  CircularProgress,
} from '@mui/material';
import { ArrowBack, People } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { useChannelStore } from '../../store/channelStore';
import { useAuthStore } from '../../store/authStore';
import { Avatar } from '../../components/common/Avatar';
import { ChannelPostCard } from '../../components/channel/ChannelPostCard';
import { channelsApi } from '../../api/channels.api';
import { Channel } from '../../types/channel.types';
import toast from 'react-hot-toast';

export const ChannelView = () => {
  const navigate = useNavigate();
  const { channelId } = useParams<{ channelId: string }>();
  const { user } = useAuthStore();
  const { posts, isLoading, subscribe, unsubscribe, createPost, deletePost } = useChannelStore();
  const [channel, setChannel] = useState<Channel | null>(null);
  const [postContent, setPostContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (channelId) {
      loadChannel();
    }
  }, [channelId]);

  const loadChannel = async () => {
    if (!channelId) return;

    try {
      const data = await channelsApi.getChannelById(channelId);
      setChannel(data);
    } catch (error) {
      console.error('Error loading channel:', error);
      toast.error('Ошибка при загрузке канала');
      navigate('/channels');
    }
  };

  const handleSubscribe = async () => {
    if (!channelId) return;

    try {
      if (channel?.isSubscribed) {
        await unsubscribe(channelId);
      } else {
        await subscribe(channelId);
      }
      await loadChannel();
    } catch (error) {
      console.error('Error toggling subscription:', error);
    }
  };

  const handleSubmitPost = async () => {
    if (!channelId || !postContent.trim()) return;

    setSubmitting(true);
    try {
      await createPost(channelId, postContent.trim());
      setPostContent('');
    } catch (error) {
      console.error('Error creating post:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (window.confirm('Вы уверены, что хотите удалить этот пост?')) {
      try {
        await deletePost(postId);
      } catch (error) {
        console.error('Error deleting post:', error);
      }
    }
  };

  const isOwner = channel && user && channel.ownerId === user.id;
  const channelPosts = channelId ? posts[channelId] || [] : [];

  if (!channel) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Шапка */}
      <AppBar position="static" color="default" elevation={1}>
        <Toolbar>
          <IconButton edge="start" onClick={() => navigate('/channels')} sx={{ mr: 2 }}>
            <ArrowBack />
          </IconButton>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
            <Avatar src={channel.avatarUrl} alt={channel.name} size={40} />
            <Box>
              <Typography variant="h6">{channel.name}</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <People fontSize="small" />
                <Typography variant="caption" color="text.secondary">
                  {channel.subscribersCount} подписчиков
                </Typography>
              </Box>
            </Box>
          </Box>
          {!isOwner && (
            <Button
              variant={channel.isSubscribed ? 'outlined' : 'contained'}
              onClick={handleSubscribe}
            >
              {channel.isSubscribed ? 'Отписаться' : 'Подписаться'}
            </Button>
          )}
        </Toolbar>
      </AppBar>

      {/* Контент */}
      <Box sx={{ flex: 1, overflow: 'auto', bgcolor: 'background.default' }}>
        <Container maxWidth="md" sx={{ py: 3 }}>
          {/* Описание канала */}
          {channel.description && (
            <Paper sx={{ p: 2, mb: 3 }}>
              <Typography variant="body2" color="text.secondary">
                {channel.description}
              </Typography>
            </Paper>
          )}

          {/* Форма создания поста (только для владельца) */}
          {isOwner && (
            <Paper sx={{ p: 2, mb: 3 }}>
              <TextField
                placeholder="Напишите новый пост..."
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                fullWidth
                multiline
                rows={4}
                disabled={submitting}
              />
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                <Button
                  variant="contained"
                  onClick={handleSubmitPost}
                  disabled={submitting || !postContent.trim()}
                >
                  {submitting ? 'Публикация...' : 'Опубликовать'}
                </Button>
              </Box>
            </Paper>
          )}

          {/* Список постов */}
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : channelPosts.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography variant="h6" color="text.secondary">
                Пока нет постов в этом канале
              </Typography>
            </Box>
          ) : (
            channelPosts.map((post) => (
              <ChannelPostCard
                key={post.id}
                post={post}
                onDelete={handleDeletePost}
                isOwner={isOwner}
              />
            ))
          )}
        </Container>
      </Box>
    </Box>
  );
};
