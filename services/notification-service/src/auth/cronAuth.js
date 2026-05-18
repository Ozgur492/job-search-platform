import config from '../config.js';

export function cronAuth(req, res, next) {
  const secret = req.headers['x-cron-secret'];
  if (!secret || secret !== config.cronSecret) {
    return res.status(403).json({
      error: { code: 'FORBIDDEN', message: 'Invalid cron secret' },
    });
  }
  next();
}
