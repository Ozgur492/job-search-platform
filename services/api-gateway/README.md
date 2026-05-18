# API Gateway

Spring Cloud Gateway that routes all frontend traffic to the appropriate backend microservice.

## Tech Stack

- Spring Cloud Gateway 4.x (reactive)
- Java 21
- Port: 8080

## Routes

| Path Pattern | Target Service |
|---|---|
| `/api/v1/jobs/**`, `/api/v1/companies/**`, `/api/v1/job-alerts/**`, `/api/v1/users/**` | Job Posting Service (:8081) |
| `/api/v1/search/**` | Job Search Service (:8082) |
| `/api/v1/notifications/**` | Notification Service (:8083) |
| `/api/v1/agent/**` | AI Agent Service (:8084) |

## Global Filters

- **CorrelationIdFilter**: generates `X-Correlation-Id` if not present, propagates downstream and to response
- **RateLimitFilter**: in-memory token bucket, 60 requests/minute per IP, returns 429 when exceeded

## Running Locally

```bash
cd services/api-gateway
mvn spring-boot:run
```

Make sure all downstream services are running.

## Environment Variables

```
JOB_POSTING_URL=http://localhost:8081
JOB_SEARCH_URL=http://localhost:8082
NOTIFICATION_URL=http://localhost:8083
AI_AGENT_URL=http://localhost:8084
FRONTEND_ORIGIN=http://localhost:5173
```

## Testing

```bash
# Test routing to Job Posting Service
curl http://localhost:8080/api/v1/jobs

# Test routing to Job Search Service
curl "http://localhost:8080/api/v1/search/jobs?city=Izmir"

# Verify correlation ID in response
curl -v http://localhost:8080/api/v1/jobs 2>&1 | grep X-Correlation-Id

# Test rate limiting (run in a loop)
for i in $(seq 1 65); do curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8080/api/v1/jobs; done
```

## Docker Build

```bash
docker build -t api-gateway .
docker tag api-gateway acrjobsearchfinal.azurecr.io/api-gateway:latest
docker push acrjobsearchfinal.azurecr.io/api-gateway:latest
```
