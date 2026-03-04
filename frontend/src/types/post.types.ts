import { User } from './user.types';

export interface Post {
  id: string;
  authorId: string;
  content: string;
  likesCount: number;
  commentsCount: number;
  createdAt: Date;
  updatedAt: Date;
  author: User;
  likes?: PostLike[];
  isLiked?: boolean; // Добавляется для текущего пользователя
}

export interface PostLike {
  id: string;
  postId: string;
  userId: string;
  createdAt: Date;
  user: User;
}

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  content: string;
  replyToCommentId?: string;
  createdAt: Date;
  updatedAt: Date;
  author: User;
  replyToComment?: Comment | null;
}

export interface CreatePostDto {
  content: string;
}

export interface UpdatePostDto {
  content: string;
}

export interface CreateCommentDto {
  content: string;
  replyToCommentId?: string;
}
