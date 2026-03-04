import { redisClient } from '../config/redis';

export class CacheService {
  /**
   * Получить данные из кэша
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const data = await redisClient.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  /**
   * Сохранить данные в кэш
   */
  async set(key: string, value: any, ttl?: number): Promise<void> {
    try {
      const data = JSON.stringify(value);
      if (ttl) {
        await redisClient.setEx(key, ttl, data);
      } else {
        await redisClient.set(key, data);
      }
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }

  /**
   * Удалить данные из кэша
   */
  async del(key: string): Promise<void> {
    try {
      await redisClient.del(key);
    } catch (error) {
      console.error('Cache del error:', error);
    }
  }

  /**
   * Удалить все ключи по паттерну
   */
  async delPattern(pattern: string): Promise<void> {
    try {
      const keys = await redisClient.keys(pattern);
      if (keys.length > 0) {
        await redisClient.del(keys);
      }
    } catch (error) {
      console.error('Cache delPattern error:', error);
    }
  }

  /**
   * Проверить существование ключа
   */
  async exists(key: string): Promise<boolean> {
    try {
      const result = await redisClient.exists(key);
      return result === 1;
    } catch (error) {
      console.error('Cache exists error:', error);
      return false;
    }
  }

  /**
   * Получить или установить данные (pattern: cache-aside)
   */
  async getOrSet<T>(
    key: string,
    fetchFn: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    // Пытаемся получить из кэша
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    // Если нет в кэше, получаем из источника
    const data = await fetchFn();

    // Сохраняем в кэш
    await this.set(key, data, ttl);

    return data;
  }

  /**
   * Инкремент счетчика
   */
  async incr(key: string): Promise<number> {
    try {
      return await redisClient.incr(key);
    } catch (error) {
      console.error('Cache incr error:', error);
      return 0;
    }
  }

  /**
   * Декремент счетчика
   */
  async decr(key: string): Promise<number> {
    try {
      return await redisClient.decr(key);
    } catch (error) {
      console.error('Cache decr error:', error);
      return 0;
    }
  }

  /**
   * Установить TTL для существующего ключа
   */
  async expire(key: string, ttl: number): Promise<void> {
    try {
      await redisClient.expire(key, ttl);
    } catch (error) {
      console.error('Cache expire error:', error);
    }
  }
}

export const cacheService = new CacheService();

// Константы для TTL (в секундах)
export const CACHE_TTL = {
  USER_PROFILE: 300,        // 5 минут
  CHANNELS_LIST: 600,       // 10 минут
  UNREAD_COUNT: 60,         // 1 минута
  ONLINE_STATUS: 30,        // 30 секунд
  POSTS_FEED: 180,          // 3 минуты
};

// Генераторы ключей
export const CACHE_KEYS = {
  userProfile: (userId: string) => `user:${userId}`,
  channelsList: () => 'channels:all',
  unreadCount: (userId: string) => `notifications:unread:${userId}`,
  userOnline: (userId: string) => `user:online:${userId}`,
  postsFeed: (page: number) => `feed:posts:${page}`,
};
