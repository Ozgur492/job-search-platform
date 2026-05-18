import config from './config.js';
import logger from './logger.js';
import { connectMongo, closeMongo } from './db/mongo.js';
import { closePool } from './db/postgres.js';
import { initFirebase } from './auth/firebase.js';
import { startReceiver, stopReceiver } from './servicebus/receiver.js';
import { createServer } from './server.js';

async function main() {
  logger.info('Starting Notification Service...');

  // Initialize Firebase
  initFirebase();

  // Connect to MongoDB
  await connectMongo();

  // Start Service Bus receiver (if configured)
  await startReceiver();

  // Create and start the Express server
  const app = createServer();
  const server = app.listen(config.port, () => {
    logger.info({ port: config.port }, 'Notification Service is running');
  });

  // Graceful shutdown
  const shutdown = async (signal) => {
    logger.info({ signal }, 'Shutting down...');
    server.close();
    await stopReceiver();
    await closeMongo();
    await closePool();
    process.exit(0);
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

main().catch((err) => {
  logger.fatal({ err }, 'Failed to start Notification Service');
  process.exit(1);
});
