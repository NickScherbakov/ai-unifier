import { Request, Response } from 'express';
import client from 'prom-client';
import { config } from '@config/index';

// Create a Registry
const register = new client.Registry();

// Add default metrics
if (config.features.enablePrometheus) {
  client.collectDefaultMetrics({ register });
}

// Custom metrics
export const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register]
});

export const httpRequestTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register]
});

export const providerRequestTotal = new client.Counter({
  name: 'provider_requests_total',
  help: 'Total number of provider requests',
  labelNames: ['provider', 'model', 'status'],
  registers: [register]
});

export const providerRequestDuration = new client.Histogram({
  name: 'provider_request_duration_seconds',
  help: 'Duration of provider requests in seconds',
  labelNames: ['provider', 'model'],
  registers: [register]
});

export const tokenUsageTotal = new client.Counter({
  name: 'token_usage_total',
  help: 'Total number of tokens used',
  labelNames: ['provider', 'model', 'type'],
  registers: [register]
});

// Middleware to collect metrics
export const metricsMiddleware = (req: Request, res: Response, next: Function) => {
  if (!config.features.enablePrometheus) {
    return next();
  }

  const start = Date.now();

  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    const route = req.route ? req.route.path : req.path;

    httpRequestDuration.labels(req.method, route, res.statusCode.toString()).observe(duration);
    httpRequestTotal.labels(req.method, route, res.statusCode.toString()).inc();
  });

  next();
};

// Endpoint to expose metrics
export const metricsEndpoint = async (req: Request, res: Response) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
};

export { register };
