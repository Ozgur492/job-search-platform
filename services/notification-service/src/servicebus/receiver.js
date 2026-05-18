import { ServiceBusClient } from '@azure/service-bus';
import config from '../config.js';
import logger from '../logger.js';
import { jobAlertMatcher } from '../jobs/jobAlertMatcher.js';

let sbClient;
let receiver;

/**
 * Starts a long-running Service Bus receiver on the "new-job-postings" queue.
 * Processes messages with peekLock mode, dead-letters after 5 failures.
 */
export async function startReceiver() {
  if (!config.serviceBus.connectionString) {
    logger.warn('SERVICEBUS_CONNECTION_STRING not set, skipping Service Bus receiver');
    return;
  }

  try {
    sbClient = new ServiceBusClient(config.serviceBus.connectionString);
    receiver = sbClient.createReceiver(config.serviceBus.queue, {
      receiveMode: 'peekLock',
      maxConcurrentCalls: 10,
    });

    receiver.subscribe({
      processMessage: async (message) => {
        const correlationId = message.applicationProperties?.correlationId || 'unknown';
        logger.info({ correlationId, messageId: message.messageId }, 'Processing Service Bus message');

        try {
          const newJob = message.body;
          const matchCount = await jobAlertMatcher(newJob);
          logger.info({ correlationId, matchCount }, 'Job alert matching complete');
          await receiver.completeMessage(message);
        } catch (err) {
          const deliveryCount = message.deliveryCount || 0;
          if (deliveryCount >= 4) {
            logger.error({ err, correlationId, deliveryCount }, 'Dead-lettering message after 5 attempts');
            await receiver.deadLetterMessage(message, {
              deadLetterReason: 'MaxRetriesExceeded',
              deadLetterErrorDescription: err.message,
            });
          } else {
            logger.warn({ err, correlationId, deliveryCount }, 'Abandoning message for retry');
            await receiver.abandonMessage(message);
          }
        }
      },
      processError: async (args) => {
        logger.error({ err: args.error, source: args.errorSource }, 'Service Bus receiver error');
      },
    });

    logger.info({ queue: config.serviceBus.queue }, 'Service Bus receiver started');
  } catch (err) {
    logger.error({ err }, 'Failed to start Service Bus receiver');
  }
}

export async function stopReceiver() {
  if (receiver) await receiver.close();
  if (sbClient) await sbClient.close();
}
