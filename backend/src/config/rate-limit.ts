import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { redisClient } from './redis';

/**
 * Rate limiting configuration using Redis store
 * Защита от brute force атак и DDoS
 */

/**
 * Общий лимит для API endpoints
 * 100 requests per 15 minutes
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    error: 'Too Many Requests',
    message: 'Слишком много запросов с вашего IP. Пожалуйста, попробуйте позже.',
    retryAfter: '15 minutes',
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  store: new RedisStore({
    // @ts-expect-error - RedisStore типы могут не совпадать с текущей версией
    client: redisClient,
    prefix: 'rl:api:',
  }),
  skip: (req) => {
    // Skip rate limiting for health check endpoints
    return req.path === '/health' || req.path === '/api/health';
  },
});

/**
 * Строгий лимит для аутентификации
 * 5 attempts per 15 minutes
 * Защита от brute force атак на /login и /register
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login/register attempts per windowMs
  message: {
    error: 'Too Many Login Attempts',
    message: 'Слишком много попыток входа/регистрации. Попробуйте снова через 15 минут.',
    retryAfter: '15 minutes',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false, // Count all requests, even successful ones
  store: new RedisStore({
    // @ts-expect-error - RedisStore типы могут не совпадать с текущей версией
    client: redisClient,
    prefix: 'rl:auth:',
  }),
});

/**
 * Лимит для загрузки файлов
 * 20 uploads per hour
 */
export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // Limit each IP to 20 uploads per hour
  message: {
    error: 'Too Many Uploads',
    message: 'Слишком много загрузок файлов. Попробуйте снова через час.',
    retryAfter: '1 hour',
  },
  standardHeaders: true,
  legacyHeaders: false,
  store: new RedisStore({
    // @ts-expect-error - RedisStore типы могут не совпадать с текущей версией
    client: redisClient,
    prefix: 'rl:upload:',
  }),
});

/**
 * Средний лимит для создания контента (посты, комментарии)
 * 30 posts/comments per 15 minutes
 */
export const createContentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // Limit each IP to 30 content creations per windowMs
  message: {
    error: 'Too Many Posts',
    message: 'Слишком много постов/комментариев. Пожалуйста, подождите немного.',
    retryAfter: '15 minutes',
  },
  standardHeaders: true,
  legacyHeaders: false,
  store: new RedisStore({
    // @ts-expect-error - RedisStore типы могут не совпадать с текущей версией
    client: redisClient,
    prefix: 'rl:content:',
  }),
});

/**
 * Лимит для WebSocket connections
 * 10 connections per minute
 */
export const websocketLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // Limit each IP to 10 websocket connections per minute
  message: {
    error: 'Too Many Connections',
    message: 'Слишком много подключений. Попробуйте снова через минуту.',
    retryAfter: '1 minute',
  },
  standardHeaders: true,
  legacyHeaders: false,
  store: new RedisStore({
    // @ts-expect-error - RedisStore типы могут не совпадать с текущей версией
    client: redisClient,
    prefix: 'rl:ws:',
  }),
});
