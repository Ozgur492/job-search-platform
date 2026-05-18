import config from './config.js';
import logger from './logger.js';
import { initFirebase } from './auth/firebase.js';
import { createServer } from './server.js';

async function main() {
  logger.info('Starting AI Agent Service...');

  // Initialize Firebase
  initFirebase();

  // Create and start the Express server
  const app = createServer();
  const server = app.listen(config.port, () => {
    logger.info({ port: config.port }, 'AI Agent Service is running');
  });

  // Graceful shutdown
  const shutdown = (signal) => {
    logger.info({ signal }, 'Shutting down...');
    server.close(() => process.exit(0));
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

main().catch((err) => {
  logger.fatal({ err }, 'Failed to start AI Agent Service');
  process.exit(1);
});
