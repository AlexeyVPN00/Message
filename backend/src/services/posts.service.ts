import { AppDataSource } from '../config/database';
import { Post } from '../models/Post.entity';
import { PostLike } from '../models/PostLike.entity';
import { Comment } from '../models/Comment.entity';
import { User } from '../models/User.entity';
import { sanitizeHtml } from '../utils/sanitize';

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

export class PostsService {
  private postRepository = AppDataSource.getRepository(Post);
  private likeRepository = AppDataSource.getRepository(PostLike);
  private commentRepository = AppDataSource.getRepository(Comment);

  /**
   * Получить ленту постов (пагинация)
   */
  async getFeedPosts(userId: string, limit: number = 20, before?: string): Promise<Post[]> {
    const queryBuilder = this.postRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.author', 'author')
      .leftJoinAndSelect('post.likes', 'likes', 'likes.userId = :userId', { userId })
      .orderBy('post.createdAt', 'DESC')
      .take(limit);

    if (before) {
      const beforePost = await this.postRepository.findOne({
        where: { id: before },
      });

      if (beforePost) {
        queryBuilder.andWhere('post.createdAt < :beforeDate', {
          beforeDate: beforePost.createdAt,
        });
      }
    }

    return await queryBuilder.getMany();
  }

  /**
   * Получить посты пользователя
   */
  async getUserPosts(authorId: string, limit: number = 20, before?: string): Promise<Post[]> {
    const queryBuilder = this.postRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.author', 'author')
      .where('post.authorId = :authorId', { authorId })
      .orderBy('post.createdAt', 'DESC')
      .take(limit);

    if (before) {
      const beforePost = await this.postRepository.findOne({
        where: { id: before },
      });

      if (beforePost) {
        queryBuilder.andWhere('post.createdAt < :beforeDate', {
          beforeDate: beforePost.createdAt,
        });
      }
    }

    return await queryBuilder.getMany();
  }

  /**
   * Получить пост по ID
   */
  async getPostById(postId: string, userId?: string): Promise<Post | null> {
    const queryBuilder = this.postRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.author', 'author')
      .where('post.id = :postId', { postId });

    if (userId) {
      queryBuilder.leftJoinAndSelect(
        'post.likes',
        'likes',
        'likes.userId = :userId',
        { userId }
      );
    }

    return await queryBuilder.getOne();
  }

  /**
   * Создать пост
   */
  async createPost(authorId: string, data: CreatePostDto): Promise<Post> {
    const post = this.postRepository.create({
      authorId,
      content: sanitizeHtml(data.content), // XSS protection
    });

    await this.postRepository.save(post);

    return await this.getPostById(post.id, authorId) as Post;
  }

  /**
   * Обновить пост
   */
  async updatePost(postId: string, userId: string, data: UpdatePostDto): Promise<Post> {
    const post = await this.postRepository.findOne({
      where: { id: postId },
    });

    if (!post) {
      throw new Error('Пост не найден');
    }

    if (post.authorId !== userId) {
      throw new Error('Только автор может редактировать пост');
    }

    post.content = sanitizeHtml(data.content); // XSS protection
    await this.postRepository.save(post);

    return await this.getPostById(postId, userId) as Post;
  }

  /**
   * Удалить пост
   */
  async deletePost(postId: string, userId: string): Promise<void> {
    const post = await this.postRepository.findOne({
      where: { id: postId },
    });

    if (!post) {
      throw new Error('Пост не найден');
    }

    if (post.authorId !== userId) {
      throw new Error('Только автор может удалить пост');
    }

    await this.postRepository.remove(post);
  }

  /**
   * Лайкнуть пост (с защитой от race conditions)
   */
  async likePost(postId: string, userId: string): Promise<PostLike> {
    // Используем транзакцию для атомарности операций
    return await AppDataSource.transaction(async (transactionalEntityManager) => {
      // Проверяем существование поста
      const post = await transactionalEntityManager.findOne(Post, {
        where: { id: postId },
      });

      if (!post) {
        throw new Error('Пост не найден');
      }

      // Проверяем, не лайкнут ли уже (внутри транзакции для консистентности)
      const existing = await transactionalEntityManager.findOne(PostLike, {
        where: { postId, userId },
      });

      if (existing) {
        return existing;
      }

      try {
        // Создаем лайк
        const like = transactionalEntityManager.create(PostLike, {
          postId,
          userId,
        });

        await transactionalEntityManager.save(like);

        // Атомарно увеличиваем счетчик
        await transactionalEntityManager.increment(
          Post,
          { id: postId },
          'likesCount',
          1
        );

        return like;
      } catch (error: any) {
        // ИСПРАВЛЕНИЕ RACE CONDITION: Если возникла ошибка unique constraint
        // (два одновременных запроса), возвращаем существующий лайк
        if (error.code === '23505' || error.message?.includes('duplicate key')) {
          const existingLike = await transactionalEntityManager.findOne(PostLike, {
            where: { postId, userId },
          });

          if (existingLike) {
            return existingLike;
          }
        }

        throw error;
      }
    });
  }

  /**
   * Убрать лайк с поста (с защитой от race conditions)
   */
  async unlikePost(postId: string, userId: string): Promise<void> {
    // Используем транзакцию для атомарности операций
    await AppDataSource.transaction(async (transactionalEntityManager) => {
      const like = await transactionalEntityManager.findOne(PostLike, {
        where: { postId, userId },
      });

      if (!like) {
        throw new Error('Лайк не найден');
      }

      await transactionalEntityManager.remove(like);

      // ИСПРАВЛЕНИЕ RACE CONDITION: Безопасный декремент (не опускается ниже 0)
      // Используем raw query для GREATEST функции PostgreSQL
      await transactionalEntityManager.query(
        `UPDATE posts SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = $1`,
        [postId]
      );
    });
  }

  /**
   * Получить лайки поста
   */
  async getPostLikes(postId: string): Promise<PostLike[]> {
    return await this.likeRepository.find({
      where: { postId },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Получить комментарии поста
   */
  async getPostComments(postId: string): Promise<Comment[]> {
    return await this.commentRepository.find({
      where: { postId },
      relations: ['author', 'replyToComment'],
      order: { createdAt: 'ASC' },
    });
  }

  /**
   * Создать комментарий
   */
  async createComment(postId: string, authorId: string, data: CreateCommentDto): Promise<Comment> {
    const post = await this.postRepository.findOne({
      where: { id: postId },
    });

    if (!post) {
      throw new Error('Пост не найден');
    }

    // Если это ответ на комментарий, проверяем существование
    if (data.replyToCommentId) {
      const replyToComment = await this.commentRepository.findOne({
        where: { id: data.replyToCommentId, postId },
      });

      if (!replyToComment) {
        throw new Error('Комментарий для ответа не найден');
      }
    }

    const comment = this.commentRepository.create({
      postId,
      authorId,
      content: sanitizeHtml(data.content), // XSS protection
      replyToCommentId: data.replyToCommentId,
    });

    await this.commentRepository.save(comment);

    // Обновляем счетчик комментариев
    await this.postRepository.increment({ id: postId }, 'commentsCount', 1);

    return await this.commentRepository.findOne({
      where: { id: comment.id },
      relations: ['author', 'replyToComment'],
    }) as Comment;
  }

  /**
   * Удалить комментарий
   */
  async deleteComment(commentId: string, userId: string): Promise<void> {
    const comment = await this.commentRepository.findOne({
      where: { id: commentId },
    });

    if (!comment) {
      throw new Error('Комментарий не найден');
    }

    if (comment.authorId !== userId) {
      throw new Error('Только автор может удалить комментарий');
    }

    await this.commentRepository.remove(comment);

    // Обновляем счетчик комментариев
    await this.postRepository.decrement({ id: comment.postId }, 'commentsCount', 1);
  }
}

export const postsService = new PostsService();
