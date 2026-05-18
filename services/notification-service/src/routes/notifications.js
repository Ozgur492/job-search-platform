import { Router } from 'express';
import { ObjectId } from 'mongodb';
import { authMiddleware } from '../auth/authMiddleware.js';
import { getNotificationsCollection } from '../db/mongo.js';
import logger from '../logger.js';

const router = Router();

/**
 * GET /me
 * Returns the last 50 notifications for the authenticated user.
 */
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const notifications = getNotificationsCollection();
    const docs = await notifications
      .find({ firebaseUid: req.user.uid })
      .sort({ createdAt: -1 })
      .limit(50)
      .toArray();

    res.json(docs);
  } catch (err) {
    logger.error({ err }, 'Error fetching notifications');
    res.status(500).json({
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch notifications' },
    });
  }
});

/**
 * POST /me/:id/read
 * Marks a notification as read. Returns 404 if not owned by the user.
 */
router.post('/me/:id/read', authMiddleware, async (req, res) => {
  try {
    const notifications = getNotificationsCollection();
    const { id } = req.params;

    let objectId;
    try {
      objectId = new ObjectId(id);
    } catch {
      return res.status(400).json({
        error: { code: 'BAD_REQUEST', message: 'Invalid notification ID' },
      });
    }

    const result = await notifications.updateOne(
      { _id: objectId, firebaseUid: req.user.uid },
      { $set: { read: true } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({
        error: { code: 'NOT_FOUND', message: 'Notification not found or not owned by you' },
      });
    }

    res.json({ success: true });
  } catch (err) {
    logger.error({ err }, 'Error marking notification as read');
    res.status(500).json({
      error: { code: 'INTERNAL_ERROR', message: 'Failed to update notification' },
    });
  }
});

export default router;
