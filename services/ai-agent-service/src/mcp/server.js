/**
 * Defines the MCP tools as Anthropic-compatible tool definitions.
 * These map to the platform's REST APIs via the gateway.
 */
export const tools = [
  {
    name: 'search_jobs',
    description: 'Search for job postings by position, city, country, and work preference. Returns a list of matching jobs.',
    input_schema: {
      type: 'object',
      properties: {
        position: { type: 'string', description: 'Job title or position keyword to search for' },
        city: { type: 'string', description: 'City to filter jobs by' },
        country: { type: 'string', description: 'Country to filter jobs by' },
        workPreference: { type: 'string', enum: ['ONSITE', 'REMOTE', 'HYBRID'], description: 'Work preference filter' },
        limit: { type: 'number', description: 'Max number of results (default 5)', default: 5 },
      },
      required: [],
    },
  },
  {
    name: 'get_job_detail',
    description: 'Get detailed information about a specific job posting including full description and application count.',
    input_schema: {
      type: 'object',
      properties: {
        jobId: { type: 'string', description: 'UUID of the job to retrieve' },
      },
      required: ['jobId'],
    },
  },
  {
    name: 'get_related_jobs',
    description: 'Get jobs related to a specific job (same city, similar title).',
    input_schema: {
      type: 'object',
      properties: {
        jobId: { type: 'string', description: 'UUID of the job to find related jobs for' },
        limit: { type: 'number', description: 'Max number of related jobs (default 3)', default: 3 },
      },
      required: ['jobId'],
    },
  },
  {
    name: 'apply_to_job',
    description: 'Apply to a specific job posting on behalf of the user. Requires the user to be authenticated.',
    input_schema: {
      type: 'object',
      properties: {
        jobId: { type: 'string', description: 'UUID of the job to apply to' },
      },
      required: ['jobId'],
    },
  },
  {
    name: 'create_job_alert',
    description: 'Create a job alert for the user to be notified when matching jobs are posted. Requires authentication.',
    input_schema: {
      type: 'object',
      properties: {
        keywords: { type: 'string', description: 'Keywords to match job titles against' },
        country: { type: 'string', description: 'Country filter for the alert' },
        city: { type: 'string', description: 'City filter for the alert' },
        workPreference: { type: 'string', enum: ['ONSITE', 'REMOTE', 'HYBRID'], description: 'Work preference filter' },
      },
      required: ['keywords'],
    },
  },
];
