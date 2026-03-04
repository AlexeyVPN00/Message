import { useEffect, useRef, useCallback } from 'react';
import {
  Box,
  Container,
  Typography,
  AppBar,
  Toolbar,
  IconButton,
  CircularProgress,
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useFeedStore } from '../../store/feedStore';
import { CreatePostForm } from '../../components/feed/CreatePostForm';
import { PostCard } from '../../components/feed/PostCard';
import { ThemeToggle } from '../../components/common/ThemeToggle';
import { NotificationBadge } from '../../components/notifications/NotificationBadge';

export const FeedPage = () => {
  const navigate = useNavigate();
  const { posts, isLoading, hasMore, loadFeedPosts } = useFeedStore();
  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadFeedPosts(true);
  }, []);

  // Infinite scroll
  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [target] = entries;
      if (target.isIntersecting && !isLoading && hasMore) {
        loadFeedPosts(false);
      }
    },
    [isLoading, hasMore, loadFeedPosts]
  );

  useEffect(() => {
    const element = observerTarget.current;
    if (!element) return;

    const observer = new IntersectionObserver(handleObserver, {
      threshold: 0.5,
    });

    observer.observe(element);

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, [handleObserver]);

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Шапка */}
      <AppBar position="static" color="default" elevation={1}>
        <Toolbar>
          <IconButton edge="start" onClick={() => navigate('/')} sx={{ mr: 2 }}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Лента
          </Typography>
          <NotificationBadge />
          <ThemeToggle />
        </Toolbar>
      </AppBar>

      {/* Контент */}
      <Box sx={{ flex: 1, overflow: 'auto', bgcolor: 'background.default' }}>
        <Container maxWidth="md" sx={{ py: 3 }}>
          {/* Форма создания поста */}
          <CreatePostForm />

          {/* Список постов */}
          {posts.length === 0 && !isLoading ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography variant="h6" color="text.secondary">
                Пока нет постов в ленте
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Создайте первый пост!
              </Typography>
            </Box>
          ) : (
            <>
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}

              {/* Infinite scroll trigger */}
              <div ref={observerTarget} style={{ height: '20px' }} />

              {/* Loading indicator */}
              {isLoading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                  <CircularProgress />
                </Box>
              )}

              {/* End of feed */}
              {!hasMore && posts.length > 0 && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  align="center"
                  sx={{ py: 3 }}
                >
                  Вы просмотрели все посты
                </Typography>
              )}
            </>
          )}
        </Container>
      </Box>
    </Box>
  );
};
