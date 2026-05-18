import express from 'express';
import pinoHttp from 'pino-http';
import logger from './logger.js';
import agentRoutes from './routes/agent.js';

export function createServer() {
  const app = express();

  // Middleware
  app.use(express.json({ limit: '100kb' }));
  app.use(pinoHttp({ logger }));

  // Health check
  app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'ai-agent-service' });
  });

  // Agent routes
  app.use('/api/v1/agent', agentRoutes);

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
