import pg from 'pg';
import config from '../config.js';
import logger from '../logger.js';

const { Pool } = pg;

let pool;

export function getPool() {
  if (!pool) {
    pool = new Pool({
      connectionString: config.postgres.url,
      max: 5,
    });
    logger.info('PostgreSQL pool created');
  }
  return pool;
}

export async function closePool() {
  if (pool) await pool.end();
}
