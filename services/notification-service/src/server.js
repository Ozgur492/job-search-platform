import express from 'express';
import pinoHttp from 'pino-http';
import logger from './logger.js';
import cronRoutes from './routes/cron.js';
import notificationRoutes from './routes/notifications.js';

export function createServer() {
  const app = express();

  // Middleware
  app.use(express.json());
  app.use(pinoHttp({ logger }));

  // Health check
  app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'notification-service' });
  });

  // Routes — all mounted under /api/v1/notifications
  app.use('/api/v1/notifications', cronRoutes);
  app.use('/api/v1/notifications', notificationRoutes);

  // 404 handler
  app.use((req, res) => {
    res.status(404).json({
      error: { code: 'NOT_FOUND', message: `Route not found: ${req.method} ${req.path}` },
    });
  });

  // Error handler
  app.use((err, req, res, _next) => {
    logger.error({ err }, 'Unhandled error');
    res.status(500).json({
      error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' },
    });
  });

  return app;
}
