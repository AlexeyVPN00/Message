import { apiClient } from './axios.config';
import { Post, PostLike, Comment, CreatePostDto, UpdatePostDto, CreateCommentDto } from '../types/post.types';

export const postsApi = {
  /**
   * Получить ленту постов
   */
  getFeedPosts: async (limit?: number, before?: string): Promise<Post[]> => {
    const response = await apiClient.get<Post[]>('/posts', {
      params: { limit, before },
    });
    return response.data;
  },

  /**
   * Получить посты пользователя
   */
  getUserPosts: async (userId: string, limit?: number, before?: string): Promise<Post[]> => {
    const response = await apiClient.get<Post[]>(`/posts/user/${userId}`, {
      params: { limit, before },
    });
    return response.data;
  },

  /**
   * Получить пост по ID
   */
  getPostById: async (postId: string): Promise<Post> => {
    const response = await apiClient.get<Post>(`/posts/${postId}`);
    return response.data;
  },

  /**
   * Создать пост
   */
  createPost: async (data: CreatePostDto): Promise<Post> => {
    const response = await apiClient.post<Post>('/posts', data);
    return response.data;
  },

  /**
   * Обновить пост
   */
  updatePost: async (postId: string, data: UpdatePostDto): Promise<Post> => {
    const response = await apiClient.put<Post>(`/posts/${postId}`, data);
    return response.data;
  },

  /**
   * Удалить пост
   */
  deletePost: async (postId: string): Promise<void> => {
    await apiClient.delete(`/posts/${postId}`);
  },

  /**
   * Лайкнуть пост
   */
  likePost: async (postId: string): Promise<PostLike> => {
    const response = await apiClient.post<PostLike>(`/posts/${postId}/like`);
    return response.data;
  },

  /**
   * Убрать лайк
   */
  unlikePost: async (postId: string): Promise<void> => {
    await apiClient.delete(`/posts/${postId}/like`);
  },

  /**
   * Получить лайки поста
   */
  getPostLikes: async (postId: string): Promise<PostLike[]> => {
    const response = await apiClient.get<PostLike[]>(`/posts/${postId}/likes`);
    return response.data;
  },

  /**
   * Получить комментарии поста
   */
  getPostComments: async (postId: string): Promise<Comment[]> => {
    const response = await apiClient.get<Comment[]>(`/posts/${postId}/comments`);
    return response.data;
  },

  /**
   * Создать комментарий
   */
  createComment: async (postId: string, data: CreateCommentDto): Promise<Comment> => {
    const response = await apiClient.post<Comment>(`/posts/${postId}/comments`, data);
    return response.data;
  },

  /**
   * Удалить комментарий
   */
  deleteComment: async (commentId: string): Promise<void> => {
    await apiClient.delete(`/posts/comments/${commentId}`);
  },
};
