import { createClient } from 'redis';
import { config } from '@config/index';
import { logger } from './logger';

let redisClient: ReturnType<typeof createClient> | null = null;

export const connectRedis = async () => {
  try {
    redisClient = createClient({
      url: config.redis.url,
      password: config.redis.password,
      database: config.redis.db
    });

    redisClient.on('error', (err) => {
      logger.error('Redis error:', err);
    });

    redisClient.on('connect', () => {
      logger.info('Redis connected');
    });

    await redisClient.connect();
    return redisClient;
  } catch (error) {
    logger.error('Failed to connect to Redis:', error);
    throw error;
  }
};

export const getRedisClient = () => {
  if (!redisClient) {
    throw new Error('Redis client not initialized');
  }
  return redisClient;
};

export const disconnectRedis = async () => {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
  }
};
