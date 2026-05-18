import axios from 'axios';
import config from '../config.js';

/**
 * Creates an axios instance that targets the API Gateway.
 * Propagates correlation ID and optionally the user's auth token.
 */
export function createHttpClient(correlationId, userToken) {
  const headers = {};
  if (correlationId) headers['X-Correlation-Id'] = correlationId;
  if (userToken) headers['Authorization'] = `Bearer ${userToken}`;

  return axios.create({
    baseURL: config.gatewayUrl,
    timeout: 15000,
    headers,
  });
}
