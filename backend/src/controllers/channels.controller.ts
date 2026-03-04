import { Request, Response } from 'express';
import { channelsService } from '../services/channels.service';

export class ChannelsController {
  /**
   * GET /api/channels - Получить список каналов
   */
  async getChannels(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      const includePrivate = req.query.includePrivate === 'true';

      const channels = await channelsService.getChannels(userId, includePrivate);

      res.json(channels);
    } catch (error) {
      console.error('Error getting channels:', error);
      res.status(500).json({ message: 'Ошибка при получении каналов' });
    }
  }

  /**
   * GET /api/channels/:id - Получить канал по ID
   */
  async getChannelById(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      const channelId = req.params.id;

      const channel = await channelsService.getChannelById(channelId, userId);

      if (!channel) {
        res.status(404).json({ message: 'Канал не найден' });
        return;
      }

      res.json(channel);
    } catch (error) {
      console.error('Error getting channel:', error);
      res.status(500).json({ message: 'Ошибка при получении канала' });
    }
  }

  /**
   * POST /api/channels - Создать канал
   */
  async createChannel(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      const { name, description, isPrivate } = req.body;

      if (!userId) {
        res.status(401).json({ message: 'Не авторизован' });
        return;
      }

      if (!name || !name.trim()) {
        res.status(400).json({ message: 'Название канала обязательно' });
        return;
      }

      const channel = await channelsService.createChannel(userId, {
        name: name.trim(),
        description: description?.trim(),
        isPrivate: isPrivate || false,
      });

      res.status(201).json(channel);
    } catch (error) {
      console.error('Error creating channel:', error);
      const message = error instanceof Error ? error.message : 'Ошибка при создании канала';
      res.status(400).json({ message });
    }
  }

  /**
   * PUT /api/channels/:id - Обновить канал
   */
  async updateChannel(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      const channelId = req.params.id;
      const { name, description, avatarUrl, isPrivate } = req.body;

      if (!userId) {
        res.status(401).json({ message: 'Не авторизован' });
        return;
      }

      const channel = await channelsService.updateChannel(channelId, userId, {
        name: name?.trim(),
        description: description?.trim(),
        avatarUrl,
        isPrivate,
      });

      res.json(channel);
    } catch (error) {
      console.error('Error updating channel:', error);
      const message = error instanceof Error ? error.message : 'Ошибка при обновлении канала';
      res.status(403).json({ message });
    }
  }

  /**
   * DELETE /api/channels/:id - Удалить канал
   */
  async deleteChannel(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      const channelId = req.params.id;

      if (!userId) {
        res.status(401).json({ message: 'Не авторизован' });
        return;
      }

      await channelsService.deleteChannel(channelId, userId);

      res.json({ message: 'Канал удален' });
    } catch (error) {
      console.error('Error deleting channel:', error);
      const message = error instanceof Error ? error.message : 'Ошибка при удалении канала';
      res.status(403).json({ message });
    }
  }

  /**
   * POST /api/channels/:id/subscribe - Подписаться на канал
   */
  async subscribe(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      const channelId = req.params.id;

      if (!userId) {
        res.status(401).json({ message: 'Не авторизован' });
        return;
      }

      const subscription = await channelsService.subscribe(channelId, userId);

      res.status(201).json(subscription);
    } catch (error) {
      console.error('Error subscribing to channel:', error);
      const message = error instanceof Error ? error.message : 'Ошибка при подписке';
      res.status(400).json({ message });
    }
  }

  /**
   * DELETE /api/channels/:id/subscribe - Отписаться от канала
   */
  async unsubscribe(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      const channelId = req.params.id;

      if (!userId) {
        res.status(401).json({ message: 'Не авторизован' });
        return;
      }

      await channelsService.unsubscribe(channelId, userId);

      res.json({ message: 'Подписка отменена' });
    } catch (error) {
      console.error('Error unsubscribing from channel:', error);
      const message = error instanceof Error ? error.message : 'Ошибка при отписке';
      res.status(400).json({ message });
    }
  }

  /**
   * GET /api/channels/:id/subscribers - Получить подписчиков канала
   */
  async getSubscribers(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      const channelId = req.params.id;

      if (!userId) {
        res.status(401).json({ message: 'Не авторизован' });
        return;
      }

      const subscribers = await channelsService.getSubscribers(channelId, userId);

      res.json(subscribers);
    } catch (error) {
      console.error('Error getting subscribers:', error);
      const message = error instanceof Error ? error.message : 'Ошибка при получении подписчиков';
      res.status(403).json({ message });
    }
  }

  /**
   * GET /api/channels/:id/posts - Получить посты канала
   */
  async getChannelPosts(req: Request, res: Response): Promise<void> {
    try {
      const channelId = req.params.id;
      const limit = parseInt(req.query.limit as string) || 20;
      const before = req.query.before as string;

      const posts = await channelsService.getChannelPosts(channelId, limit, before);

      res.json(posts);
    } catch (error) {
      console.error('Error getting channel posts:', error);
      const message = error instanceof Error ? error.message : 'Ошибка при получении постов';
      res.status(400).json({ message });
    }
  }

  /**
   * POST /api/channels/:id/posts - Создать пост в канале
   */
  async createPost(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      const channelId = req.params.id;
      const { content } = req.body;

      if (!userId) {
        res.status(401).json({ message: 'Не авторизован' });
        return;
      }

      if (!content || !content.trim()) {
        res.status(400).json({ message: 'Содержимое поста обязательно' });
        return;
      }

      const post = await channelsService.createPost(channelId, userId, {
        content: content.trim(),
      });

      res.status(201).json(post);
    } catch (error) {
      console.error('Error creating post:', error);
      const message = error instanceof Error ? error.message : 'Ошибка при создании поста';
      res.status(403).json({ message });
    }
  }

  /**
   * DELETE /api/channels/posts/:postId - Удалить пост
   */
  async deletePost(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      const postId = req.params.postId;

      if (!userId) {
        res.status(401).json({ message: 'Не авторизован' });
        return;
      }

      await channelsService.deletePost(postId, userId);

      res.json({ message: 'Пост удален' });
    } catch (error) {
      console.error('Error deleting post:', error);
      const message = error instanceof Error ? error.message : 'Ошибка при удалении поста';
      res.status(403).json({ message });
    }
  }

  /**
   * POST /api/channels/posts/:postId/view - Увеличить счетчик просмотров
   */
  async incrementPostViews(req: Request, res: Response): Promise<void> {
    try {
      const postId = req.params.postId;

      await channelsService.incrementPostViews(postId);

      res.json({ message: 'Просмотр учтен' });
    } catch (error) {
      console.error('Error incrementing views:', error);
      res.status(500).json({ message: 'Ошибка при обновлении просмотров' });
    }
  }

  /**
   * GET /api/channels/subscriptions - Получить подписки пользователя
   */
  async getUserSubscriptions(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({ message: 'Не авторизован' });
        return;
      }

      const channels = await channelsService.getUserSubscriptions(userId);

      res.json(channels);
    } catch (error) {
      console.error('Error getting user subscriptions:', error);
      res.status(500).json({ message: 'Ошибка при получении подписок' });
    }
  }
}

export const channelsController = new ChannelsController();
