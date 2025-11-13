import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import 'express-async-errors';
import { config } from '@config/index';
import { logger } from '@utils/logger';
import { errorHandler } from '@middleware/errorHandler';
import { requestLogger } from '@middleware/requestLogger';
import { rateLimiter } from '@middleware/rateLimiter';
import routes from '@api/routes';
import { metricsMiddleware, metricsEndpoint } from '@utils/metrics';
import { connectDatabase } from '@db/connection';
import { connectRedis } from '@utils/redis';
import { initializeProviders } from '@providers/index';

const app: Express = express();

// Security middleware
app.use(helmet());
app.use(
  cors({
    origin: config.cors.origin,
    credentials: true,
  })
);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression
app.use(compression());

// Request logging
app.use(requestLogger);

// Metrics collection
app.use(metricsMiddleware);

// Rate limiting
app.use(rateLimiter);

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: config.env,
  });
});

// Metrics endpoint for Prometheus
app.get('/metrics', metricsEndpoint);

// API routes
app.use('/api/v1', routes);

// API documentation (Swagger)
if (config.env !== 'production') {
  import('swagger-ui-express').then(swaggerUi => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const swaggerDocument = require('./swagger.json');
    app.use('/api/docs', swaggerUi.default.serve, swaggerUi.default.setup(swaggerDocument));
  });
}

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`,
    timestamp: new Date().toISOString(),
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Graceful shutdown handler
const gracefulShutdown = async () => {
  logger.info('Received shutdown signal, closing server gracefully...');

  process.exit(0);
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Start server
const startServer = async () => {
  try {
    // Connect to database
    await connectDatabase();
    logger.info('Database connected');

    // Connect to Redis
    await connectRedis();
    logger.info('Redis connected');

    // Initialize AI providers
    await initializeProviders();
    logger.info('AI providers initialized');

    const port = config.port;
    app.listen(port, () => {
      logger.info(`AI Unifier Backend started on port ${port}`);
      logger.info(`Environment: ${config.env}`);
      logger.info(`API Documentation: http://localhost:${port}/api/docs`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle uncaught exceptions
process.on('uncaughtException', error => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

startServer();

export default app;
