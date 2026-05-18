import { Router } from 'express';
import { verifyToken } from '../auth/firebase.js';
import { chat } from '../agent/claudeAgent.js';
import logger from '../logger.js';

const router = Router();

/**
 * POST /api/v1/agent/chat
 *
 * Body: { message: string, history?: Array<{role,content}> }
 * Headers: Authorization: Bearer <firebase_token> (optional for public search, required for apply/alerts)
 *
 * Response: { response: string, toolCalls: Array, usage?: {inputTokens, outputTokens} }
 */
router.post('/chat', async (req, res) => {
  const correlationId = req.headers['x-correlation-id'] || crypto.randomUUID();
  const { message, history } = req.body;

  if (!message || typeof message !== 'string') {
    return res.status(400).json({
      error: { code: 'BAD_REQUEST', message: 'message is required and must be a string' },
    });
  }

  // Extract user token if present (optional auth)
  let userToken = null;
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    userToken = authHeader.substring(7);
    try {
      const decoded = await verifyToken(userToken);
      logger.info({ uid: decoded.uid, correlationId }, 'Authenticated chat request');
    } catch {
      userToken = null; // Invalid token, proceed without auth
      logger.debug({ correlationId }, 'Invalid token provided, proceeding without auth');
    }
  }

  // Build conversation history
  const conversationHistory = [];

  // Add any prior history
  if (Array.isArray(history)) {
    for (const msg of history) {
      if (msg.role && msg.content) {
        conversationHistory.push({
          role: msg.role === 'user' ? 'user' : 'assistant',
          content: typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content),
        });
      }
    }
  }

  // Add current user message
  conversationHistory.push({ role: 'user', content: message });

  try {
    const result = await chat(conversationHistory, correlationId, userToken);

    res.json({
      response: result.response,
      toolCalls: result.toolCalls,
      usage: result.usage || null,
    });
  } catch (err) {
    logger.error({ err, correlationId }, 'Chat error');

    if (err.status === 429) {
      return res.status(429).json({
        error: { code: 'RATE_LIMIT', message: 'AI rate limit exceeded. Please try again later.' },
      });
    }

    res.status(500).json({
      error: { code: 'INTERNAL_ERROR', message: 'Failed to process chat message' },
    });
  }
});

/**
 * GET /api/v1/agent/tools
 * Returns the list of available MCP tools (for debugging/documentation).
 */
router.get('/tools', (req, res) => {
  import('../mcp/server.js').then(({ tools }) => {
    res.json({ tools });
  });
});

export default router;
