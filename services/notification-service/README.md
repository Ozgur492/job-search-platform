# Notification Service

Queue consumer and scheduled notification jobs for the job search platform.

## Responsibilities

1. **Queue Consumer**: Listens to Azure Service Bus `new-job-postings` queue, matches new jobs against user job alerts, creates JOB_ALERT notifications
2. **Related Jobs Cron**: Daily scan of recent searches in MongoDB, finds matching new jobs, creates RELATED_JOB notifications
3. **Notification API**: REST endpoints for users to read their notifications

## Tech Stack

- Node 20 / Express 4 (ES Modules)
- MongoDB (notifications storage, search history reads)
- PostgreSQL (read-only, job_alerts table)
- Azure Service Bus (queue consumer)
- Firebase Admin SDK (JWT verification)
- Pino (structured logging)
- Port: 8083

## Endpoints

```
POST /api/v1/notifications/cron/job-alerts      (X-Cron-Secret required)
POST /api/v1/notifications/cron/related-jobs     (X-Cron-Secret required)
GET  /api/v1/notifications/me                    (Firebase auth required)
POST /api/v1/notifications/me/:id/read           (Firebase auth required)
GET  /health                                     (public)
```

## Running Locally

```bash
# Ensure data infrastructure is running
docker-compose up -d

# Install dependencies
cd services/notification-service
npm install

# Start the service
npm start
# or with file watching:
npm run dev
```

## Example Curls

```bash
# Health check
curl http://localhost:8083/health

# Trigger related jobs cron
curl -X POST http://localhost:8083/api/v1/notifications/cron/related-jobs \
  -H "X-Cron-Secret: changeme-long-random-string"

# Get my notifications
curl http://localhost:8083/api/v1/notifications/me \
  -H "Authorization: Bearer <token>"

# Mark notification as read
curl -X POST http://localhost:8083/api/v1/notifications/me/<notification-id>/read \
  -H "Authorization: Bearer <token>"
```

## Environment Variables

See `.env.example` for the full list.

## Docker Build

```bash
docker build -t notification-service .
docker tag notification-service acrjobsearchfinal.azurecr.io/notification-service:latest
docker push acrjobsearchfinal.azurecr.io/notification-service:latest
```

## GitHub Actions Cron

Two workflows trigger this service's endpoints:
- `notification-cron-job-alerts.yml` — every 30 minutes
- `notification-cron-related-jobs.yml` — daily at 03:00 UTC
