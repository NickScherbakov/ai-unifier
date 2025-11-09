import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const configSchema = z.object({
  env: z.enum(['development', 'production', 'test']).default('development'),
  port: z.number().default(4000),
  apiBaseUrl: z.string().default('http://localhost:4000'),
  
  database: z.object({
    url: z.string(),
    poolMin: z.number().default(2),
    poolMax: z.number().default(10)
  }),
  
  redis: z.object({
    url: z.string(),
    password: z.string().optional(),
    db: z.number().default(0)
  }),
  
  security: z.object({
    jwtSecret: z.string(),
    jwtExpiresIn: z.string().default('7d'),
    apiKeySalt: z.string(),
    encryptionKey: z.string()
  }),
  
  cors: z.object({
    origin: z.string().or(z.array(z.string())).default('http://localhost:3000')
  }),
  
  rateLimit: z.object({
    windowMs: z.number().default(60000),
    maxRequests: z.number().default(100)
  }),
  
  providers: z.object({
    openai: z.object({
      apiKey: z.string().optional(),
      baseUrl: z.string().optional()
    }),
    anthropic: z.object({
      apiKey: z.string().optional()
    }),
    google: z.object({
      apiKey: z.string().optional()
    }),
    mistral: z.object({
      apiKey: z.string().optional()
    }),
    cohere: z.object({
      apiKey: z.string().optional()
    })
  }),
  
  features: z.object({
    enableCache: z.boolean().default(true),
    cacheTtlSeconds: z.number().default(3600),
    enablePrometheus: z.boolean().default(true),
    enableLogging: z.boolean().default(true),
    logLevel: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
    enableMultimodal: z.boolean().default(true),
    enableStreaming: z.boolean().default(true),
    enableBatchRequests: z.boolean().default(true),
    enableWebhooks: z.boolean().default(true)
  }),
  
  performance: z.object({
    maxConcurrentRequests: z.number().default(100),
    requestQueueSize: z.number().default(1000),
    providerTimeoutMs: z.number().default(30000)
  })
});

const parseConfig = () => {
  const rawConfig = {
    env: process.env.NODE_ENV as 'development' | 'production' | 'test',
    port: parseInt(process.env.PORT || '4000', 10),
    apiBaseUrl: process.env.API_BASE_URL || 'http://localhost:4000',
    
    database: {
      url: process.env.DATABASE_URL || 'postgresql://ai_unifier:password@localhost:5432/ai_unifier',
      poolMin: parseInt(process.env.DATABASE_POOL_MIN || '2', 10),
      poolMax: parseInt(process.env.DATABASE_POOL_MAX || '10', 10)
    },
    
    redis: {
      url: process.env.REDIS_URL || 'redis://localhost:6379',
      password: process.env.REDIS_PASSWORD,
      db: parseInt(process.env.REDIS_DB || '0', 10)
    },
    
    security: {
      jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-in-production',
      jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
      apiKeySalt: process.env.API_KEY_SALT || 'dev-salt-change-in-production',
      encryptionKey: process.env.ENCRYPTION_KEY || 'dev-key-32chars-change-prod!!'
    },
    
    cors: {
      origin: process.env.CORS_ORIGIN || 'http://localhost:3000'
    },
    
    rateLimit: {
      windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10),
      maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10)
    },
    
    providers: {
      openai: {
        apiKey: process.env.OPENAI_API_KEY,
        baseUrl: process.env.OPENAI_BASE_URL
      },
      anthropic: {
        apiKey: process.env.ANTHROPIC_API_KEY
      },
      google: {
        apiKey: process.env.GOOGLE_API_KEY
      },
      mistral: {
        apiKey: process.env.MISTRAL_API_KEY
      },
      cohere: {
        apiKey: process.env.COHERE_API_KEY
      }
    },
    
    features: {
      enableCache: process.env.ENABLE_CACHE === 'true',
      cacheTtlSeconds: parseInt(process.env.CACHE_TTL_SECONDS || '3600', 10),
      enablePrometheus: process.env.ENABLE_PROMETHEUS !== 'false',
      enableLogging: process.env.ENABLE_LOGGING !== 'false',
      logLevel: (process.env.LOG_LEVEL || 'info') as 'error' | 'warn' | 'info' | 'debug',
      enableMultimodal: process.env.ENABLE_MULTIMODAL !== 'false',
      enableStreaming: process.env.ENABLE_STREAMING !== 'false',
      enableBatchRequests: process.env.ENABLE_BATCH_REQUESTS !== 'false',
      enableWebhooks: process.env.ENABLE_WEBHOOKS !== 'false'
    },
    
    performance: {
      maxConcurrentRequests: parseInt(process.env.MAX_CONCURRENT_REQUESTS || '100', 10),
      requestQueueSize: parseInt(process.env.REQUEST_QUEUE_SIZE || '1000', 10),
      providerTimeoutMs: parseInt(process.env.PROVIDER_TIMEOUT_MS || '30000', 10)
    }
  };

  return configSchema.parse(rawConfig);
};

export const config = parseConfig();
