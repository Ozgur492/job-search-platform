import Anthropic from '@anthropic-ai/sdk';
import config from '../config.js';
import logger from '../logger.js';
import { tools } from '../mcp/server.js';
import { dispatchTool } from '../mcp/dispatcher.js';

const SYSTEM_PROMPT = `You are JobBot, a helpful AI career assistant for a job search platform.

Your capabilities:
- Search for jobs by position, city, country, and work preference
- Show detailed information about specific job postings
- Find related jobs similar to a given job
- Apply to jobs on behalf of the user (requires authentication)
- Create job alerts for future matching jobs (requires authentication)

Guidelines:
- Always be friendly, professional, and helpful
- When presenting job results, format them clearly with key details
- If the user asks to apply and they're not authenticated, explain they need to log in
- When searching, try to extract position and location from natural language queries
- Proactively suggest related searches or actions
- Respond in the same language the user uses (Turkish or English)
- Keep responses concise but informative`;

/**
 * Orchestrates a multi-turn conversation with Claude, handling tool calls.
 * Implements the MCP agentic loop: send → tool_use → dispatch → tool_result → continue
 */
export async function chat(conversationHistory, correlationId, userToken) {
  if (!config.anthropic.apiKey) {
    return {
      response: 'AI agent is not configured. Please set ANTHROPIC_API_KEY.',
      toolCalls: [],
    };
  }

  const client = new Anthropic({ apiKey: config.anthropic.apiKey });
  const allToolCalls = [];

  let messages = [...conversationHistory];
  let iteration = 0;
  const MAX_ITERATIONS = 5;

  while (iteration < MAX_ITERATIONS) {
    iteration++;
    logger.info({ iteration, messageCount: messages.length, correlationId }, 'Calling Claude API');

    const response = await client.messages.create({
      model: config.anthropic.model,
      max_tokens: config.anthropic.maxTokens,
      system: SYSTEM_PROMPT,
      tools,
      messages,
    });

    // Check if the response wants to use tools
    if (response.stop_reason === 'tool_use') {
      // Extract tool use blocks
      const toolUseBlocks = response.content.filter((block) => block.type === 'tool_use');
      const textBlocks = response.content.filter((block) => block.type === 'text');

      // Add assistant response to conversation
      messages.push({ role: 'assistant', content: response.content });

      // Process each tool call
      const toolResults = [];
      for (const toolUse of toolUseBlocks) {
        logger.info({ tool: toolUse.name, input: toolUse.input, correlationId }, 'Dispatching tool call');

        try {
          const result = await dispatchTool(toolUse.name, toolUse.input, correlationId, userToken);
          allToolCalls.push({
            tool: toolUse.name,
            input: toolUse.input,
            result: 'success',
          });

          toolResults.push({
            type: 'tool_result',
            tool_use_id: toolUse.id,
            content: JSON.stringify(result),
          });
        } catch (err) {
          logger.error({ err, tool: toolUse.name, correlationId }, 'Tool call failed');
          allToolCalls.push({
            tool: toolUse.name,
            input: toolUse.input,
            result: 'error',
            error: err.message,
          });

          toolResults.push({
            type: 'tool_result',
            tool_use_id: toolUse.id,
            content: JSON.stringify({ error: err.message }),
            is_error: true,
          });
        }
      }

      // Add tool results to conversation
      messages.push({ role: 'user', content: toolResults });

      // Continue the loop to let Claude process tool results
      continue;
    }

    // Stop reason is 'end_turn' — extract final text response
    const finalText = response.content
      .filter((block) => block.type === 'text')
      .map((block) => block.text)
      .join('\n');

    return {
      response: finalText,
      toolCalls: allToolCalls,
      usage: {
        inputTokens: response.usage?.input_tokens,
        outputTokens: response.usage?.output_tokens,
      },
    };
  }

  // If we hit max iterations, return whatever we have
  return {
    response: 'I made several tool calls to find information for you, but reached the processing limit. Please try a more specific query.',
    toolCalls: allToolCalls,
  };
}
