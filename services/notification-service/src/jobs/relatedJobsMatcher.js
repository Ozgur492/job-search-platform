import { getJobSearchesCollection, getNotificationsCollection } from '../db/mongo.js';
import config from '../config.js';
import logger from '../logger.js';
import axios from 'axios';

/**
 * Scans the last 24h of job_searches from MongoDB, queries the Job Posting
 * Service for matching jobs, and writes RELATED_JOB notifications.
 */
export async function relatedJobsMatcher() {
  const searches = getJobSearchesCollection();
  const notifications = getNotificationsCollection();
  let searchesScanned = 0;
  let notificationsCreated = 0;

  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  // Aggregate: get the most recent search per user in the last 24h
  const pipeline = [
    { $match: { createdAt: { $gte: twentyFourHoursAgo } } },
    { $sort: { createdAt: -1 } },
    {
      $group: {
        _id: '$userId',
        firebaseUid: { $first: '$firebaseUid' },
        query: { $first: '$query' },
        createdAt: { $first: '$createdAt' },
      },
    },
  ];

  const userSearches = await searches.aggregate(pipeline).toArray();
  searchesScanned = userSearches.length;

  for (const search of userSearches) {
    try {
      const { _id: userId, firebaseUid, query } = search;

      // Build query params for Job Posting Service
      const params = new URLSearchParams();
      params.set('page', '0');
      params.set('size', '3');
      if (query.city) params.set('city', query.city);
      if (query.country) params.set('country', query.country);

      const response = await axios.get(
        `${config.jobPostingServiceUrl}/api/v1/jobs?${params.toString()}`
      );

      const jobs = response.data?.data || [];

      // Filter to jobs posted in the last 24h
      const recentJobs = jobs.filter((job) => {
        if (!job.postedAt) return false;
        return new Date(job.postedAt) >= twentyFourHoursAgo;
      });

      for (const job of recentJobs.slice(0, 3)) {
        // Duplicate suppression
        const existing = await notifications.findOne({
          userId: userId,
          jobId: job.id,
          type: 'RELATED_JOB',
          createdAt: { $gte: twentyFourHoursAgo },
        });

        if (existing) continue;

        const querySummary = [query.position, query.city, query.country]
          .filter(Boolean)
          .join(', ');

        await notifications.insertOne({
          userId: userId,
          firebaseUid: firebaseUid || userId,
          type: 'RELATED_JOB',
          jobId: job.id,
          jobTitle: job.title,
          city: job.city,
          matchedReason: `similar to your search: ${querySummary}`,
          read: false,
          createdAt: new Date(),
        });

        notificationsCreated++;
        logger.info({ userId, jobId: job.id }, 'Created RELATED_JOB notification');
      }
    } catch (err) {
      logger.error({ err, userId: search._id }, 'Error processing related jobs for user');
    }
  }

  return { searchesScanned, notificationsCreated };
}
