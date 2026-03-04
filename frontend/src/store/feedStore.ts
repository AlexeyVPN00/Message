import { create } from 'zustand';
import { postsApi } from '../api/posts.api';
import { Post, Comment } from '../types/post.types';
import toast from 'react-hot-toast';

interface FeedState {
  posts: Post[];
  comments: Record<string, Comment[]>; // postId -> comments
  isLoading: boolean;
  hasMore: boolean;

  // Actions
  loadFeedPosts: (reset?: boolean) => Promise<void>;
  loadUserPosts: (userId: string, reset?: boolean) => Promise<void>;
  loadPostComments: (postId: string) => Promise<void>;
  createPost: (content: string) => Promise<void>;
  updatePost: (postId: string, content: string) => Promise<void>;
  deletePost: (postId: string) => Promise<void>;
  likePost: (postId: string) => Promise<void>;
  unlikePost: (postId: string) => Promise<void>;
  createComment: (postId: string, content: string, replyToCommentId?: string) => Promise<void>;
  deleteComment: (commentId: string) => Promise<void>;
}

export const useFeedStore = create<FeedState>((set, get) => ({
  posts: [],
  comments: {},
  isLoading: false,
  hasMore: true,

  loadFeedPosts: async (reset = false) => {
    try {
      set({ isLoading: true });
      const { posts } = get();
      const before = reset || posts.length === 0 ? undefined : posts[posts.length - 1]?.id;

      const newPosts = await postsApi.getFeedPosts(20, before);

      set((state) => ({
        posts: reset ? newPosts : [...state.posts, ...newPosts],
        hasMore: newPosts.length === 20,
        isLoading: false,
      }));
    } catch (error) {
      console.error('Error loading feed posts:', error);
      toast.error('Ошибка при загрузке ленты');
      set({ isLoading: false });
    }
  },

  loadUserPosts: async (userId: string, reset = false) => {
    try {
      set({ isLoading: true });
      const { posts } = get();
      const before = reset || posts.length === 0 ? undefined : posts[posts.length - 1]?.id;

      const newPosts = await postsApi.getUserPosts(userId, 20, before);

      set((state) => ({
        posts: reset ? newPosts : [...state.posts, ...newPosts],
        hasMore: newPosts.length === 20,
        isLoading: false,
      }));
    } catch (error) {
      console.error('Error loading user posts:', error);
      toast.error('Ошибка при загрузке постов');
      set({ isLoading: false });
    }
  },

  loadPostComments: async (postId: string) => {
    try {
      const comments = await postsApi.getPostComments(postId);

      set((state) => ({
        comments: {
          ...state.comments,
          [postId]: comments,
        },
      }));
    } catch (error) {
      console.error('Error loading comments:', error);
      toast.error('Ошибка при загрузке комментариев');
    }
  },

  createPost: async (content: string) => {
    try {
      const post = await postsApi.createPost({ content });

      set((state) => ({
        posts: [post, ...state.posts],
      }));

      toast.success('Пост создан');
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error('Ошибка при создании поста');
      throw error;
    }
  },

  updatePost: async (postId: string, content: string) => {
    try {
      const updatedPost = await postsApi.updatePost(postId, { content });

      set((state) => ({
        posts: state.posts.map((post) =>
          post.id === postId ? updatedPost : post
        ),
      }));

      toast.success('Пост обновлен');
    } catch (error) {
      console.error('Error updating post:', error);
      toast.error('Ошибка при обновлении поста');
      throw error;
    }
  },

  deletePost: async (postId: string) => {
    try {
      await postsApi.deletePost(postId);

      set((state) => ({
        posts: state.posts.filter((post) => post.id !== postId),
      }));

      toast.success('Пост удален');
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error('Ошибка при удалении поста');
      throw error;
    }
  },

  likePost: async (postId: string) => {
    try {
      await postsApi.likePost(postId);

      set((state) => ({
        posts: state.posts.map((post) =>
          post.id === postId
            ? {
                ...post,
                likesCount: post.likesCount + 1,
                isLiked: true,
              }
            : post
        ),
      }));
    } catch (error) {
      console.error('Error liking post:', error);
      toast.error('Ошибка при лайке');
      throw error;
    }
  },

  unlikePost: async (postId: string) => {
    try {
      await postsApi.unlikePost(postId);

      set((state) => ({
        posts: state.posts.map((post) =>
          post.id === postId
            ? {
                ...post,
                likesCount: Math.max(0, post.likesCount - 1),
                isLiked: false,
              }
            : post
        ),
      }));
    } catch (error) {
      console.error('Error unliking post:', error);
      toast.error('Ошибка при удалении лайка');
      throw error;
    }
  },

  createComment: async (postId: string, content: string, replyToCommentId?: string) => {
    try {
      const comment = await postsApi.createComment(postId, { content, replyToCommentId });

      set((state) => {
        const postComments = state.comments[postId] || [];

        return {
          comments: {
            ...state.comments,
            [postId]: [...postComments, comment],
          },
          posts: state.posts.map((post) =>
            post.id === postId
              ? { ...post, commentsCount: post.commentsCount + 1 }
              : post
          ),
        };
      });

      toast.success('Комментарий добавлен');
    } catch (error) {
      console.error('Error creating comment:', error);
      toast.error('Ошибка при создании комментария');
      throw error;
    }
  },

  deleteComment: async (commentId: string) => {
    try {
      await postsApi.deleteComment(commentId);

      set((state) => {
        const newComments = { ...state.comments };
        let postId: string | null = null;

        Object.keys(newComments).forEach((pId) => {
          const filtered = newComments[pId].filter((c) => c.id !== commentId);
          if (filtered.length !== newComments[pId].length) {
            postId = pId;
            newComments[pId] = filtered;
          }
        });

        return {
          comments: newComments,
          posts: postId
            ? state.posts.map((post) =>
                post.id === postId
                  ? { ...post, commentsCount: Math.max(0, post.commentsCount - 1) }
                  : post
              )
            : state.posts,
        };
      });

      toast.success('Комментарий удален');
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast.error('Ошибка при удалении комментария');
      throw error;
    }
  },
}));
