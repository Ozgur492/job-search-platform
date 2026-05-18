# AI Agent Service

Claude-powered AI career assistant using MCP (Model Context Protocol) for the job search platform.

## Overview

The AI Agent uses Claude claude-opus-4-7 with tool-calling (MCP) to provide a natural-language interface to the platform. Users can search for jobs, get details, apply, and create alerts through a conversational interface.

## Architecture

```
User → POST /api/v1/agent/chat
         ↓
    Claude API (with MCP tools)
         ↓ tool_use
    MCP Dispatcher → API Gateway → Backend Services
         ↓ tool_result
    Claude API (processes results)
         ↓ end_turn
    Final response → User
```

## MCP Tools

| Tool | Description | Auth Required |
|---|---|---|
| `search_jobs` | Search by position, city, country, work preference | No |
| `get_job_detail` | Get full job details + application count | No |
| `get_related_jobs` | Find similar jobs | No |
| `apply_to_job` | Apply to a job | Yes |
| `create_job_alert` | Create an alert for future jobs | Yes |

## Endpoints

```
POST /api/v1/agent/chat    # Send a chat message
GET  /api/v1/agent/tools   # List available MCP tools
GET  /health               # Health check
```

## Running Locally

```bash
cd services/ai-agent-service
npm install

# Set your Anthropic API key
export ANTHROPIC_API_KEY=sk-ant-...

npm start
# or with file watching:
npm run dev
```

## Example Curl

```bash
# Simple job search
curl -X POST http://localhost:8084/api/v1/agent/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "İstanbulda uzaktan çalışılabilecek yazılım geliştirici pozisyonları var mı?"}'

# With auth (for apply/alerts)
curl -X POST http://localhost:8084/api/v1/agent/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <firebase_token>" \
  -d '{"message": "Bu ilana başvurmak istiyorum", "history": [...]}'

# List tools
curl http://localhost:8084/api/v1/agent/tools
```

## Environment Variables

```
PORT=8084
ANTHROPIC_API_KEY=sk-ant-...
ANTHROPIC_MODEL=claude-opus-4-7
GATEWAY_URL=http://localhost:8080
FIREBASE_CREDENTIALS_JSON=...
```

## Docker Build

```bash
docker build -t ai-agent-service .
docker tag ai-agent-service acrjobsearchfinal.azurecr.io/ai-agent-service:latest
docker push acrjobsearchfinal.azurecr.io/ai-agent-service:latest
```
