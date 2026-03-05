import { useEffect, useRef, useCallback } from 'react';
import {
  Box,
  Container,
  Typography,
  CircularProgress,
} from '@mui/material';
import { useFeedStore } from '../../store/feedStore';
import { CreatePostForm } from '../../components/feed/CreatePostForm';
import { PostCard } from '../../components/feed/PostCard';
import { MainLayout } from '../../layouts/MainLayout';

export const FeedPage = () => {
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
    <MainLayout>
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Container maxWidth="md" sx={{ py: 3, flex: 1, overflow: 'auto' }}>
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
    </MainLayout>
  );
};
