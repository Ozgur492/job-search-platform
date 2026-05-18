import { Router } from 'express';
import { cronAuth } from '../auth/cronAuth.js';
import { jobAlertMatcher } from '../jobs/jobAlertMatcher.js';
import { relatedJobsMatcher } from '../jobs/relatedJobsMatcher.js';
import logger from '../logger.js';

const router = Router();

/**
 * POST /cron/job-alerts
 * Triggered by GitHub Actions cron. Drains Service Bus queue messages
 * or runs a batch of job alert matching.
 */
router.post('/cron/job-alerts', cronAuth, async (req, res) => {
  try {
    logger.info('Cron job-alerts triggered');
    // The actual queue processing is done by the long-running receiver.
    // This endpoint can be used as a health-check/trigger confirmation.
    res.json({ processed: 0, matched: 0, message: 'Queue receiver is running continuously' });
  } catch (err) {
    logger.error({ err }, 'Error in cron job-alerts');
    res.status(500).json({
      error: { code: 'INTERNAL_ERROR', message: err.message },
    });
  }
});

/**
 * POST /cron/related-jobs
 * Triggered daily by GitHub Actions. Scans recent searches and creates
 * RELATED_JOB notifications.
 */
router.post('/cron/related-jobs', cronAuth, async (req, res) => {
  try {
    logger.info('Cron related-jobs triggered');
    const result = await relatedJobsMatcher();
    logger.info(result, 'Related jobs cron complete');
    res.json(result);
  } catch (err) {
    logger.error({ err }, 'Error in cron related-jobs');
    res.status(500).json({
      error: { code: 'INTERNAL_ERROR', message: err.message },
    });
  }
});

export default router;
