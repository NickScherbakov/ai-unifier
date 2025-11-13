import Redis from 'ioredis';
import { config } from '@config/index';
import { logger } from './logger';

let redisClient: Redis | null = null;

export const connectRedis = async () => {
  try {
    // Parse redis URL or use individual config
    const redisUrl = config.redis.url;
    const urlMatch = redisUrl.match(/redis:\/\/([^:]+)?:?(\d+)?/);

    const redisConfig = {
      host: urlMatch ? urlMatch[1] || 'localhost' : 'localhost',
      port: urlMatch && urlMatch[2] ? parseInt(urlMatch[2], 10) : 6379,
      password: config.redis.password,
      db: config.redis.db || 0,
      retryStrategy: (times: number) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
    };

    redisClient = new Redis(redisConfig);

    redisClient.on('error', (err: Error) => {
      logger.error('Redis error:', err);
    });

    redisClient.on('connect', () => {
      logger.info('Redis connected');
    });

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
