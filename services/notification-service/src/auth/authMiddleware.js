import { verifyToken } from './firebase.js';
import logger from '../logger.js';

export function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: { code: 'UNAUTHORIZED', message: 'Missing or invalid Authorization header' },
    });
  }

  const token = authHeader.substring(7);
  verifyToken(token)
    .then((decoded) => {
      req.user = {
        uid: decoded.uid,
        email: decoded.email || '',
      };
      next();
    })
    .catch((err) => {
      logger.error({ err }, 'Firebase token verification failed');
      res.status(401).json({
        error: { code: 'UNAUTHORIZED', message: 'Invalid or expired token' },
      });
    });
}
