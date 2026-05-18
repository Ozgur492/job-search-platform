import { getPool } from '../db/postgres.js';
import { getNotificationsCollection } from '../db/mongo.js';
import logger from '../logger.js';

/**
 * Given a new job, find matching alerts in PostgreSQL job_alerts table
 * and write notification documents to MongoDB.
 */
export async function jobAlertMatcher(newJob) {
  const pool = getPool();
  const notifications = getNotificationsCollection();
  let matchCount = 0;

  const { jobId, title, city, country, town, workPreference } = newJob;

  // Split title into keywords for matching
  const titleWords = title.toLowerCase().split(/\s+/).filter(w => w.length > 2);

  // Build dynamic query for keyword matching
  let query = `
    SELECT ja.id, ja.user_id, ja.keywords, u.firebase_uid
    FROM job_alerts ja
    JOIN users u ON ja.user_id = u.id
    WHERE 1=1
  `;
  const params = [];
  let paramIdx = 1;

  // Match any keyword from the alert against the job title
  if (titleWords.length > 0) {
    const keywordConditions = titleWords.map(() => {
      params.push(`%${titleWords[paramIdx - 1]}%`);
      return `ja.keywords ILIKE $${paramIdx++}`;
    });
    // At least one keyword should match
    query += ` AND (${keywordConditions.join(' OR ')})`;
  }

  // Location filters (NULL means "any")
  if (country) {
    query += ` AND (ja.country IS NULL OR ja.country = $${paramIdx})`;
    params.push(country);
    paramIdx++;
  }
  if (city) {
    query += ` AND (ja.city IS NULL OR ja.city = $${paramIdx})`;
    params.push(city);
    paramIdx++;
  }
  if (town) {
    query += ` AND (ja.town IS NULL OR ja.town = $${paramIdx})`;
    params.push(town);
    paramIdx++;
  }
  if (workPreference) {
    query += ` AND (ja.work_preference IS NULL OR ja.work_preference = $${paramIdx})`;
    params.push(workPreference);
    paramIdx++;
  }

  try {
    const result = await pool.query(query, params);

    for (const row of result.rows) {
      // Duplicate suppression: check if notification already exists in last 24h
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const existing = await notifications.findOne({
        userId: row.user_id,
        jobId: jobId,
        type: 'JOB_ALERT',
        createdAt: { $gte: twentyFourHoursAgo },
      });

      if (existing) {
        logger.debug({ userId: row.user_id, jobId }, 'Skipping duplicate JOB_ALERT notification');
        continue;
      }

      await notifications.insertOne({
        userId: row.user_id,
        firebaseUid: row.firebase_uid,
        type: 'JOB_ALERT',
        jobId: jobId,
        jobTitle: title,
        city: city,
        matchedReason: `matches alert: ${row.keywords}`,
        read: false,
        createdAt: new Date(),
      });

      matchCount++;
      logger.info({ userId: row.user_id, jobId, keywords: row.keywords }, 'Created JOB_ALERT notification');
    }
  } catch (err) {
    logger.error({ err, jobId }, 'Error in jobAlertMatcher');
    throw err;
  }

  return matchCount;
}
