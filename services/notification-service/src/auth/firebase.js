import admin from 'firebase-admin';
import config from '../config.js';
import logger from '../logger.js';

export function initFirebase() {
  if (admin.apps.length > 0) return;

  if (config.firebase.credentialsJson) {
    try {
      const credentials = JSON.parse(config.firebase.credentialsJson);
      admin.initializeApp({
        credential: admin.credential.cert(credentials),
      });
      logger.info('Firebase initialized from FIREBASE_CREDENTIALS_JSON');
    } catch (err) {
      logger.error({ err }, 'Failed to initialize Firebase');
    }
  } else {
    logger.warn('No Firebase credentials configured');
  }
}

export async function verifyToken(token) {
  return admin.auth().verifyIdToken(token);
}

export default admin;
