import { createClient } from 'redis';
import * as dotenv from 'dotenv';

dotenv.config();

export const redisClient = createClient({
  socket: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6380'),
  },
  password: process.env.REDIS_PASSWORD || undefined,
});

redisClient.on('error', (err) => console.error('❌ Redis Client Error:', err));
redisClient.on('connect', () => console.log('✅ Redis connected'));

export const initializeRedis = async () => {
  try {
    await redisClient.connect();
    console.log('✅ Redis connection established');
  } catch (error) {
    console.error('❌ Redis connection failed:', error);
    throw error;
  }
};
