import { AppDataSource } from '../config/database';
import { Post } from '../models/Post.entity';
import { PostLike } from '../models/PostLike.entity';
import { Comment } from '../models/Comment.entity';
import { User } from '../models/User.entity';

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
      content: data.content,
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

    post.content = data.content;
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
   * Лайкнуть пост
   */
  async likePost(postId: string, userId: string): Promise<PostLike> {
    const post = await this.postRepository.findOne({
      where: { id: postId },
    });

    if (!post) {
      throw new Error('Пост не найден');
    }

    // Проверяем, не лайкнут ли уже
    const existing = await this.likeRepository.findOne({
      where: { postId, userId },
    });

    if (existing) {
      return existing;
    }

    const like = this.likeRepository.create({
      postId,
      userId,
    });

    await this.likeRepository.save(like);

    // Обновляем счетчик лайков
    await this.postRepository.increment({ id: postId }, 'likesCount', 1);

    return like;
  }

  /**
   * Убрать лайк с поста
   */
  async unlikePost(postId: string, userId: string): Promise<void> {
    const like = await this.likeRepository.findOne({
      where: { postId, userId },
    });

    if (!like) {
      throw new Error('Лайк не найден');
    }

    await this.likeRepository.remove(like);

    // Обновляем счетчик лайков
    await this.postRepository.decrement({ id: postId }, 'likesCount', 1);
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
      content: data.content,
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
