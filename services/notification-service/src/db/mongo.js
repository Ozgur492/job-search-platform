import { MongoClient } from 'mongodb';
import config from '../config.js';
import logger from '../logger.js';

let client;
let db;

export async function connectMongo() {
  client = new MongoClient(config.mongo.url);
  await client.connect();
  db = client.db(config.mongo.db);
  logger.info('Connected to MongoDB');

  // Ensure indexes
  await db.collection('notifications').createIndex({ userId: 1, createdAt: -1 });
  await db.collection('notifications').createIndex(
    { userId: 1, jobId: 1, type: 1, createdAt: 1 },
    { name: 'idx_dedup' }
  );

  return db;
}

export function getDb() {
  if (!db) throw new Error('MongoDB not connected');
  return db;
}

export function getNotificationsCollection() {
  return getDb().collection('notifications');
}

export function getJobSearchesCollection() {
  return getDb().collection('job_searches');
}

export async function closeMongo() {
  if (client) await client.close();
}
