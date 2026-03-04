# Оптимизация Backend

## 1. Индексы базы данных

### Существующие индексы (уже реализованы через @Index()):

**Users:**
- `email` - для быстрого поиска по email при логине
- `username` - для быстрого поиска пользователей
- `is_online` - для фильтрации онлайн пользователей

**ChatMembers:**
- `chat_id` - для получения участников чата
- `user_id` - для получения чатов пользователя

**Messages:**
- `chat_id` - для получения сообщений чата
- `sender_id` - для поиска сообщений от пользователя
- `created_at` - для сортировки по времени

**Notifications:**
- `recipient_id` - для получения уведомлений пользователя
- `is_read` - для фильтрации непрочитанных
- `created_at` - для сортировки

### Составные индексы (для улучшения производительности):

**Messages:**
- `(chat_id, created_at)` - для пагинации сообщений в чате
- `(sender_id, created_at)` - для истории сообщений пользователя

**Notifications:**
- `(recipient_id, is_read, created_at)` - для быстрой фильтрации непрочитанных уведомлений

**ChatMembers:**
- `(chat_id, user_id)` - UNIQUE constraint, улучшает поиск участника в чате

**Posts:**
- `(author_id, created_at)` - для ленты постов пользователя

**ChannelPosts:**
- `(channel_id, created_at)` - для получения постов канала

## 2. Оптимизация запросов

### N+1 проблема - решения:

**Чаты с участниками:**
```typescript
// До оптимизации (N+1):
const chats = await chatRepository.find({ where: { ... }});
// Для каждого чата отдельный запрос для members

// После оптимизации:
const chats = await chatRepository.find({
  where: { ... },
  relations: ['members', 'members.user'],
  order: { updatedAt: 'DESC' }
});
```

**Сообщения с отправителем:**
```typescript
const messages = await messageRepository.find({
  where: { chatId },
  relations: ['sender'],
  order: { createdAt: 'DESC' },
  take: 50
});
```

## 3. Redis кэширование

### Что кэшировать:

1. **Профили пользователей** (TTL: 5 минут)
   - Ключ: `user:${userId}`
   - Инвалидация: при обновлении профиля

2. **Список каналов** (TTL: 10 минут)
   - Ключ: `channels:all`
   - Инвалидация: при создании/удалении канала

3. **Счетчик непрочитанных уведомлений** (TTL: 1 минута)
   - Ключ: `notifications:unread:${userId}`
   - Инвалидация: при чтении уведомления

4. **Онлайн статус пользователей** (TTL: 30 секунд)
   - Ключ: `user:online:${userId}`
   - Real-time обновление через WebSocket

### Пример реализации:

```typescript
// cache.service.ts
export class CacheService {
  constructor(private redis: Redis) {}

  async get<T>(key: string): Promise<T | null> {
    const data = await this.redis.get(key);
    return data ? JSON.parse(data) : null;
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    const data = JSON.stringify(value);
    if (ttl) {
      await this.redis.setex(key, ttl, data);
    } else {
      await this.redis.set(key, data);
    }
  }

  async del(key: string): Promise<void> {
    await this.redis.del(key);
  }
}
```

## 4. Пагинация

### Cursor-based pagination (уже реализовано):

```typescript
// Вместо OFFSET/LIMIT (медленно на больших таблицах)
const posts = await postRepository
  .createQueryBuilder('post')
  .where('post.createdAt < :cursor', { cursor: before })
  .orderBy('post.createdAt', 'DESC')
  .take(limit)
  .getMany();
```

## 5. Lazy loading relationships

TypeORM по умолчанию использует lazy loading. Для оптимизации используем:
- `relations: []` - eager loading нужных связей
- `select: []` - выбираем только нужные поля

## 6. Database connection pooling

```typescript
// database.ts
export const AppDataSource = new DataSource({
  // ...
  extra: {
    max: 20,        // максимум 20 подключений в пуле
    min: 5,         // минимум 5 подключений
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  }
});
```

## 7. Мониторинг

### Query logging (только для development):

```typescript
logging: process.env.NODE_ENV === 'development' ? ['query', 'error'] : ['error'],
maxQueryExecutionTime: 1000, // предупреждение о медленных запросах > 1s
```

## Итого:

✅ Индексы на всех внешних ключах и часто фильтруемых полях
✅ Составные индексы для сложных запросов
✅ Eager loading для устранения N+1 проблемы
✅ Redis кэширование для часто запрашиваемых данных
✅ Cursor-based pagination
✅ Connection pooling
✅ Query monitoring
