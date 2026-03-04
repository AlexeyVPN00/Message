import { Request, Response } from 'express';
import { postsService } from '../services/posts.service';

export class PostsController {
  /**
   * GET /api/posts - Получить ленту постов
   */
  async getFeedPosts(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({ message: 'Не авторизован' });
        return;
      }

      const limit = parseInt(req.query.limit as string) || 20;
      const before = req.query.before as string;

      const posts = await postsService.getFeedPosts(userId, limit, before);

      res.json(posts);
    } catch (error) {
      console.error('Error getting feed posts:', error);
      res.status(500).json({ message: 'Ошибка при получении ленты' });
    }
  }

  /**
   * GET /api/posts/user/:userId - Получить посты пользователя
   */
  async getUserPosts(req: Request, res: Response): Promise<void> {
    try {
      const authorId = req.params.userId;
      const limit = parseInt(req.query.limit as string) || 20;
      const before = req.query.before as string;

      const posts = await postsService.getUserPosts(authorId, limit, before);

      res.json(posts);
    } catch (error) {
      console.error('Error getting user posts:', error);
      res.status(500).json({ message: 'Ошибка при получении постов' });
    }
  }

  /**
   * GET /api/posts/:id - Получить пост по ID
   */
  async getPostById(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      const postId = req.params.id;

      const post = await postsService.getPostById(postId, userId);

      if (!post) {
        res.status(404).json({ message: 'Пост не найден' });
        return;
      }

      res.json(post);
    } catch (error) {
      console.error('Error getting post:', error);
      res.status(500).json({ message: 'Ошибка при получении поста' });
    }
  }

  /**
   * POST /api/posts - Создать пост
   */
  async createPost(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      const { content } = req.body;

      if (!userId) {
        res.status(401).json({ message: 'Не авторизован' });
        return;
      }

      if (!content || !content.trim()) {
        res.status(400).json({ message: 'Содержимое поста обязательно' });
        return;
      }

      const post = await postsService.createPost(userId, {
        content: content.trim(),
      });

      res.status(201).json(post);
    } catch (error) {
      console.error('Error creating post:', error);
      const message = error instanceof Error ? error.message : 'Ошибка при создании поста';
      res.status(400).json({ message });
    }
  }

  /**
   * PUT /api/posts/:id - Обновить пост
   */
  async updatePost(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      const postId = req.params.id;
      const { content } = req.body;

      if (!userId) {
        res.status(401).json({ message: 'Не авторизован' });
        return;
      }

      if (!content || !content.trim()) {
        res.status(400).json({ message: 'Содержимое поста обязательно' });
        return;
      }

      const post = await postsService.updatePost(postId, userId, {
        content: content.trim(),
      });

      res.json(post);
    } catch (error) {
      console.error('Error updating post:', error);
      const message = error instanceof Error ? error.message : 'Ошибка при обновлении поста';
      res.status(403).json({ message });
    }
  }

  /**
   * DELETE /api/posts/:id - Удалить пост
   */
  async deletePost(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      const postId = req.params.id;

      if (!userId) {
        res.status(401).json({ message: 'Не авторизован' });
        return;
      }

      await postsService.deletePost(postId, userId);

      res.json({ message: 'Пост удален' });
    } catch (error) {
      console.error('Error deleting post:', error);
      const message = error instanceof Error ? error.message : 'Ошибка при удалении поста';
      res.status(403).json({ message });
    }
  }

  /**
   * POST /api/posts/:id/like - Лайкнуть пост
   */
  async likePost(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      const postId = req.params.id;

      if (!userId) {
        res.status(401).json({ message: 'Не авторизован' });
        return;
      }

      const like = await postsService.likePost(postId, userId);

      res.status(201).json(like);
    } catch (error) {
      console.error('Error liking post:', error);
      const message = error instanceof Error ? error.message : 'Ошибка при лайке';
      res.status(400).json({ message });
    }
  }

  /**
   * DELETE /api/posts/:id/like - Убрать лайк
   */
  async unlikePost(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      const postId = req.params.id;

      if (!userId) {
        res.status(401).json({ message: 'Не авторизован' });
        return;
      }

      await postsService.unlikePost(postId, userId);

      res.json({ message: 'Лайк убран' });
    } catch (error) {
      console.error('Error unliking post:', error);
      const message = error instanceof Error ? error.message : 'Ошибка при удалении лайка';
      res.status(400).json({ message });
    }
  }

  /**
   * GET /api/posts/:id/likes - Получить лайки поста
   */
  async getPostLikes(req: Request, res: Response): Promise<void> {
    try {
      const postId = req.params.id;

      const likes = await postsService.getPostLikes(postId);

      res.json(likes);
    } catch (error) {
      console.error('Error getting post likes:', error);
      res.status(500).json({ message: 'Ошибка при получении лайков' });
    }
  }

  /**
   * GET /api/posts/:id/comments - Получить комментарии поста
   */
  async getPostComments(req: Request, res: Response): Promise<void> {
    try {
      const postId = req.params.id;

      const comments = await postsService.getPostComments(postId);

      res.json(comments);
    } catch (error) {
      console.error('Error getting post comments:', error);
      res.status(500).json({ message: 'Ошибка при получении комментариев' });
    }
  }

  /**
   * POST /api/posts/:id/comments - Создать комментарий
   */
  async createComment(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      const postId = req.params.id;
      const { content, replyToCommentId } = req.body;

      if (!userId) {
        res.status(401).json({ message: 'Не авторизован' });
        return;
      }

      if (!content || !content.trim()) {
        res.status(400).json({ message: 'Содержимое комментария обязательно' });
        return;
      }

      const comment = await postsService.createComment(postId, userId, {
        content: content.trim(),
        replyToCommentId,
      });

      res.status(201).json(comment);
    } catch (error) {
      console.error('Error creating comment:', error);
      const message = error instanceof Error ? error.message : 'Ошибка при создании комментария';
      res.status(400).json({ message });
    }
  }

  /**
   * DELETE /api/posts/comments/:commentId - Удалить комментарий
   */
  async deleteComment(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      const commentId = req.params.commentId;

      if (!userId) {
        res.status(401).json({ message: 'Не авторизован' });
        return;
      }

      await postsService.deleteComment(commentId, userId);

      res.json({ message: 'Комментарий удален' });
    } catch (error) {
      console.error('Error deleting comment:', error);
      const message = error instanceof Error ? error.message : 'Ошибка при удалении комментария';
      res.status(403).json({ message });
    }
  }
}

export const postsController = new PostsController();
