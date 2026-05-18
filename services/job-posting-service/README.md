# Job Posting Service

CRUD service for companies, job postings, applications, and job alerts.

## Tech Stack

- Spring Boot 3.3 / Java 21
- PostgreSQL 16 (via Flyway migrations)
- Redis 7 (caching with 5-min TTL)
- Firebase Admin SDK (JWT verification)
- Port: 8081

## Prerequisites

- Docker Compose running (Postgres + Redis)
- Firebase service account key

## Running Locally

```bash
# From repo root, start data infrastructure
docker-compose up -d

# Run the service
cd services/job-posting-service
mvn spring-boot:run
```

## API Endpoints

### Companies

```bash
# Create company (ADMIN only)
curl -X POST http://localhost:8081/api/v1/companies \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"name":"Acme Corp","description":"Tech company"}'

# Get company (public)
curl http://localhost:8081/api/v1/companies/{id}

# Update company (ADMIN or COMPANY)
curl -X PATCH http://localhost:8081/api/v1/companies/{id} \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"name":"Acme Corp Updated"}'
```

### Jobs

```bash
# List jobs (public, paginated)
curl "http://localhost:8081/api/v1/jobs?page=0&size=5"

# Get job detail (public, cached)
curl http://localhost:8081/api/v1/jobs/{id}

# Create job (ADMIN or COMPANY)
curl -X POST http://localhost:8081/api/v1/jobs \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"companyId":"...","title":"Web Developer","description":"...","country":"Turkey","city":"Izmir","workPreference":"ONSITE","employmentType":"FULL_TIME"}'

# Get related jobs (public)
curl "http://localhost:8081/api/v1/jobs/{id}/related?limit=3"

# Get application count (public)
curl http://localhost:8081/api/v1/jobs/{id}/applications/count
```

### Applications

```bash
# Apply to job (authenticated)
curl -X POST http://localhost:8081/api/v1/jobs/{id}/applications \
  -H "Authorization: Bearer <token>"

# My applications (authenticated)
curl http://localhost:8081/api/v1/users/me/applications \
  -H "Authorization: Bearer <token>"
```

### Job Alerts

```bash
# Create alert (authenticated)
curl -X POST http://localhost:8081/api/v1/job-alerts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"keywords":"web developer","city":"Izmir"}'

# List my alerts (authenticated)
curl http://localhost:8081/api/v1/job-alerts \
  -H "Authorization: Bearer <token>"

# Delete alert (authenticated)
curl -X DELETE http://localhost:8081/api/v1/job-alerts/{id} \
  -H "Authorization: Bearer <token>"
```

## Swagger UI

Open http://localhost:8081/swagger-ui.html

## Docker Build

```bash
docker build -t job-posting-service .
docker tag job-posting-service acrjobsearchfinal.azurecr.io/job-posting-service:latest
docker push acrjobsearchfinal.azurecr.io/job-posting-service:latest
```

## Environment Variables

See `.env.example` for the full list.
