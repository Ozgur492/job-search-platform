# Deployment Guide

## Required GitHub Secrets

Configure these in your GitHub repository → Settings → Secrets and variables → Actions:

### Azure Container Registry (ACR)
```
ACR_LOGIN_SERVER       = acrjobsearchfinal.azurecr.io
ACR_USERNAME           = acrjobsearchfinal
ACR_PASSWORD           = <ACR admin password>
```

### Azure App Service Publish Profiles
Download each from Azure Portal → App Service → Deployment Center → Manage publish profile
```
AZURE_PUBLISH_PROFILE_JOB_POSTING   = <XML publish profile>
AZURE_PUBLISH_PROFILE_JOB_SEARCH    = <XML publish profile>
AZURE_PUBLISH_PROFILE_GATEWAY       = <XML publish profile>
AZURE_PUBLISH_PROFILE_NOTIFICATION  = <XML publish profile>
AZURE_PUBLISH_PROFILE_AI_AGENT      = <XML publish profile>
```

### Azure App Service Names
```
AZURE_WEBAPP_JOB_POSTING   = app-job-posting-final
AZURE_WEBAPP_JOB_SEARCH    = app-job-search-final
AZURE_WEBAPP_GATEWAY       = app-gateway-final
AZURE_WEBAPP_NOTIFICATION  = app-notification-final
AZURE_WEBAPP_AI_AGENT      = app-ai-agent-final
```

### Vercel (Frontend)
```
VERCEL_TOKEN       = <Vercel personal access token>
VERCEL_ORG_ID      = <from .vercel/project.json>
VERCEL_PROJECT_ID  = <from .vercel/project.json>
```

### Firebase (Frontend Build)
```
VITE_FIREBASE_API_KEY      = <Firebase web API key>
VITE_FIREBASE_AUTH_DOMAIN  = <project>.firebaseapp.com
VITE_FIREBASE_PROJECT_ID   = <Firebase project ID>
```

### Cron Jobs
```
GATEWAY_URL  = https://app-gateway-final.azurewebsites.net
CRON_SECRET  = <long random string>
```

## CI/CD Workflows

| Workflow | Trigger | Pipeline |
|---|---|---|
| `ci-job-posting.yml` | Push to `services/job-posting-service/` | Maven build → Test → Docker → Azure App Service |
| `ci-job-search.yml` | Push to `services/job-search-service/` | Maven build → Test → Docker → Azure App Service |
| `ci-api-gateway.yml` | Push to `services/api-gateway/` | Maven build → Docker → Azure App Service |
| `ci-notification.yml` | Push to `services/notification-service/` | npm ci → Docker → Azure App Service |
| `ci-ai-agent.yml` | Push to `services/ai-agent-service/` | npm ci → Docker → Azure App Service |
| `ci-frontend.yml` | Push to `frontend/` | npm build → Vercel deploy |
| `notification-cron-job-alerts.yml` | Every 30 min | POST /cron/job-alerts |
| `notification-cron-related-jobs.yml` | Daily 03:00 UTC | POST /cron/related-jobs |

## Manual Deployment

### Backend (any service)
```bash
# Build Docker image
cd services/<service-name>
docker build -t acrjobsearchfinal.azurecr.io/<service-name>:latest .

# Push to ACR
az acr login --name acrjobsearchfinal
docker push acrjobsearchfinal.azurecr.io/<service-name>:latest

# Restart App Service
az webapp restart --name app-<service>-final --resource-group rg-jobsearch-final
```

### Frontend
```bash
cd frontend
npm run build
npx vercel --prod
```
