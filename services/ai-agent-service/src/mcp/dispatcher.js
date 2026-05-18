import { createHttpClient } from './httpClient.js';
import logger from '../logger.js';

/**
 * Dispatches MCP tool calls to the platform's REST APIs via the gateway.
 */
export async function dispatchTool(toolName, toolInput, correlationId, userToken) {
  const http = createHttpClient(correlationId, userToken);

  switch (toolName) {
    case 'search_jobs': {
      const params = new URLSearchParams();
      if (toolInput.position) params.set('position', toolInput.position);
      if (toolInput.city) params.set('city', toolInput.city);
      if (toolInput.country) params.set('country', toolInput.country);
      if (toolInput.workPreference) params.set('workPreference', toolInput.workPreference);
      params.set('size', String(toolInput.limit || 5));
      params.set('page', '0');

      const res = await http.get(`/api/v1/search/jobs?${params.toString()}`);
      const jobs = (res.data?.data || []).map((j) => ({
        id: j.id,
        title: j.title,
        companyName: j.companyName,
        city: j.city,
        country: j.country,
        workPreference: j.workPreference,
        salaryMin: j.salaryMin,
        salaryMax: j.salaryMax,
        postedAt: j.postedAt,
      }));
      return { jobs, total: res.data?.total || jobs.length };
    }

    case 'get_job_detail': {
      const res = await http.get(`/api/v1/jobs/${toolInput.jobId}`);
      const countRes = await http.get(`/api/v1/jobs/${toolInput.jobId}/applications/count`).catch(() => ({ data: { count: 0 } }));
      return { ...res.data, applicationCount: countRes.data?.count || 0 };
    }

    case 'get_related_jobs': {
      const limit = toolInput.limit || 3;
      const res = await http.get(`/api/v1/jobs/${toolInput.jobId}/related?limit=${limit}`);
      return { relatedJobs: res.data };
    }

    case 'apply_to_job': {
      if (!userToken) {
        return { error: 'Authentication required to apply. Please log in first.' };
      }
      try {
        const res = await http.post(`/api/v1/jobs/${toolInput.jobId}/applications`);
        return { success: true, application: res.data };
      } catch (err) {
        if (err.response?.status === 409) {
          return { error: 'You have already applied to this job.' };
        }
        throw err;
      }
    }

    case 'create_job_alert': {
      if (!userToken) {
        return { error: 'Authentication required to create alerts. Please log in first.' };
      }
      const body = {
        keywords: toolInput.keywords,
        country: toolInput.country || null,
        city: toolInput.city || null,
        workPreference: toolInput.workPreference || null,
      };
      const res = await http.post('/api/v1/job-alerts', body);
      return { success: true, alert: res.data };
    }

    default:
      return { error: `Unknown tool: ${toolName}` };
  }
}
