import { AppDataSource } from '../config/database';
import { Channel } from '../models/Channel.entity';
import { ChannelSubscriber } from '../models/ChannelSubscriber.entity';
import { ChannelPost } from '../models/ChannelPost.entity';
import { User } from '../models/User.entity';
import { sanitizeHtml } from '../utils/sanitize';

export interface CreateChannelDto {
  name: string;
  description?: string;
  isPrivate?: boolean;
}

export interface UpdateChannelDto {
  name?: string;
  description?: string;
  avatarUrl?: string;
  isPrivate?: boolean;
}

export interface CreateChannelPostDto {
  content: string;
}

export class ChannelsService {
  private channelRepository = AppDataSource.getRepository(Channel);
  private subscriberRepository = AppDataSource.getRepository(ChannelSubscriber);
  private postRepository = AppDataSource.getRepository(ChannelPost);
  private userRepository = AppDataSource.getRepository(User);

  /**
   * Получить список всех каналов (с фильтрацией по публичным/приватным)
   */
  async getChannels(userId?: string, includePrivate: boolean = false): Promise<Channel[]> {
    const queryBuilder = this.channelRepository
      .createQueryBuilder('channel')
      .leftJoinAndSelect('channel.owner', 'owner')
      .orderBy('channel.subscribersCount', 'DESC')
      .addOrderBy('channel.createdAt', 'DESC');

    if (!includePrivate) {
      queryBuilder.where('channel.isPrivate = :isPrivate', { isPrivate: false });
    }

    // Если передан userId, добавляем информацию о подписке
    if (userId) {
      queryBuilder.leftJoinAndSelect(
        'channel.subscribers',
        'subscription',
        'subscription.userId = :userId',
        { userId }
      );
    }

    return await queryBuilder.getMany();
  }

  /**
   * Получить канал по ID
   */
  async getChannelById(channelId: string, userId?: string): Promise<Channel | null> {
    const queryBuilder = this.channelRepository
      .createQueryBuilder('channel')
      .leftJoinAndSelect('channel.owner', 'owner')
      .where('channel.id = :channelId', { channelId });

    if (userId) {
      queryBuilder.leftJoinAndSelect(
        'channel.subscribers',
        'subscription',
        'subscription.userId = :userId',
        { userId }
      );
    }

    return await queryBuilder.getOne();
  }

  /**
   * Создать канал
   */
  async createChannel(ownerId: string, data: CreateChannelDto): Promise<Channel> {
    const channel = this.channelRepository.create({
      name: sanitizeHtml(data.name), // XSS protection
      description: data.description ? sanitizeHtml(data.description) : undefined, // XSS protection
      isPrivate: data.isPrivate || false,
      ownerId,
    });

    await this.channelRepository.save(channel);

    // Автоматически подписываем создателя на канал
    await this.subscribe(channel.id, ownerId);

    return await this.getChannelById(channel.id, ownerId) as Channel;
  }

  /**
   * Обновить канал
   */
  async updateChannel(channelId: string, userId: string, data: UpdateChannelDto): Promise<Channel> {
    const channel = await this.channelRepository.findOne({
      where: { id: channelId },
    });

    if (!channel) {
      throw new Error('Канал не найден');
    }

    if (channel.ownerId !== userId) {
      throw new Error('Только владелец может изменять канал');
    }

    if (data.name !== undefined) {
      channel.name = sanitizeHtml(data.name); // XSS protection
    }

    if (data.description !== undefined) {
      channel.description = sanitizeHtml(data.description); // XSS protection
    }

    if (data.avatarUrl !== undefined) {
      channel.avatarUrl = data.avatarUrl;
    }

    if (data.isPrivate !== undefined) {
      channel.isPrivate = data.isPrivate;
    }

    await this.channelRepository.save(channel);

    return await this.getChannelById(channelId, userId) as Channel;
  }

  /**
   * Удалить канал
   */
  async deleteChannel(channelId: string, userId: string): Promise<void> {
    const channel = await this.channelRepository.findOne({
      where: { id: channelId },
    });

    if (!channel) {
      throw new Error('Канал не найден');
    }

    if (channel.ownerId !== userId) {
      throw new Error('Только владелец может удалить канал');
    }

    await this.channelRepository.remove(channel);
  }

  /**
   * Подписаться на канал
   */
  async subscribe(channelId: string, userId: string): Promise<ChannelSubscriber> {
    const channel = await this.channelRepository.findOne({
      where: { id: channelId },
    });

    if (!channel) {
      throw new Error('Канал не найден');
    }

    // Проверяем, не подписан ли уже
    const existing = await this.subscriberRepository.findOne({
      where: { channelId, userId },
    });

    if (existing) {
      return existing;
    }

    const subscription = this.subscriberRepository.create({
      channelId,
      userId,
    });

    await this.subscriberRepository.save(subscription);

    // Обновляем счетчик подписчиков
    await this.channelRepository.increment({ id: channelId }, 'subscribersCount', 1);

    return subscription;
  }

  /**
   * Отписаться от канала
   */
  async unsubscribe(channelId: string, userId: string): Promise<void> {
    const subscription = await this.subscriberRepository.findOne({
      where: { channelId, userId },
    });

    if (!subscription) {
      throw new Error('Подписка не найдена');
    }

    await this.subscriberRepository.remove(subscription);

    // Обновляем счетчик подписчиков
    await this.channelRepository.decrement({ id: channelId }, 'subscribersCount', 1);
  }

  /**
   * Получить подписчиков канала
   */
  async getSubscribers(channelId: string, userId: string): Promise<ChannelSubscriber[]> {
    const channel = await this.channelRepository.findOne({
      where: { id: channelId },
    });

    if (!channel) {
      throw new Error('Канал не найден');
    }

    // Если канал приватный, проверяем права доступа
    if (channel.isPrivate && channel.ownerId !== userId) {
      throw new Error('Доступ запрещен');
    }

    return await this.subscriberRepository.find({
      where: { channelId },
      relations: ['user'],
      order: { subscribedAt: 'DESC' },
    });
  }

  /**
   * Создать пост в канале
   */
  async createPost(channelId: string, userId: string, data: CreateChannelPostDto): Promise<ChannelPost> {
    const channel = await this.channelRepository.findOne({
      where: { id: channelId },
    });

    if (!channel) {
      throw new Error('Канал не найден');
    }

    if (channel.ownerId !== userId) {
      throw new Error('Только владелец может публиковать посты');
    }

    const post = this.postRepository.create({
      channelId,
      authorId: userId,
      content: sanitizeHtml(data.content), // XSS protection
    });

    await this.postRepository.save(post);

    return await this.postRepository.findOne({
      where: { id: post.id },
      relations: ['author', 'channel'],
    }) as ChannelPost;
  }

  /**
   * Получить посты канала
   */
  async getChannelPosts(channelId: string, limit: number = 20, before?: string): Promise<ChannelPost[]> {
    const channel = await this.channelRepository.findOne({
      where: { id: channelId },
    });

    if (!channel) {
      throw new Error('Канал не найден');
    }

    const queryBuilder = this.postRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.author', 'author')
      .where('post.channelId = :channelId', { channelId })
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
   * Удалить пост
   */
  async deletePost(postId: string, userId: string): Promise<void> {
    const post = await this.postRepository.findOne({
      where: { id: postId },
      relations: ['channel'],
    });

    if (!post) {
      throw new Error('Пост не найден');
    }

    if (post.channel.ownerId !== userId && post.authorId !== userId) {
      throw new Error('Недостаточно прав для удаления поста');
    }

    await this.postRepository.remove(post);
  }

  /**
   * Увеличить счетчик просмотров поста
   */
  async incrementPostViews(postId: string): Promise<void> {
    await this.postRepository.increment({ id: postId }, 'viewsCount', 1);
  }

  /**
   * Получить каналы пользователя (на которые он подписан)
   */
  async getUserSubscriptions(userId: string): Promise<Channel[]> {
    const subscriptions = await this.subscriberRepository.find({
      where: { userId },
      relations: ['channel', 'channel.owner'],
      order: { subscribedAt: 'DESC' },
    });

    return subscriptions.map((sub) => sub.channel);
  }
}

export const channelsService = new ChannelsService();
