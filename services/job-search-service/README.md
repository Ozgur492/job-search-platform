# Job Search Service

Search, autocomplete, and search history service. Reads job data from Redis cache (populated by Job Posting Service) and falls back to REST API when cache misses. Search history is stored in MongoDB.

## Tech Stack

- Spring Boot 3.3 / Java 21
- Redis 7 (reads cached jobs via SCAN)
- MongoDB (search history with 90-day TTL)
- WebClient (REST fallback to Job Posting Service)
- Firebase Admin SDK (optional auth for history)
- Port: 8082

## Endpoints

```
GET  /api/v1/search/jobs?position=&city=&country=&town=&workPreference=&page=&size=
GET  /api/v1/search/autocomplete/positions?q=&limit=10
GET  /api/v1/search/autocomplete/cities?q=&limit=10
GET  /api/v1/search/recent  (authenticated)
```

## Running Locally

```bash
# Ensure Postgres, Redis, and Mongo are running
docker-compose up -d

# Start Job Posting Service first (it populates Redis)
cd services/job-posting-service && mvn spring-boot:run

# Then start this service
cd services/job-search-service && mvn spring-boot:run
```

## Example Curls

```bash
# Search jobs
curl "http://localhost:8082/api/v1/search/jobs?position=developer&city=Izmir"

# Autocomplete positions
curl "http://localhost:8082/api/v1/search/autocomplete/positions?q=Web"

# Autocomplete cities
curl "http://localhost:8082/api/v1/search/autocomplete/cities?q=Iz"

# Recent searches (requires auth)
curl "http://localhost:8082/api/v1/search/recent" \
  -H "Authorization: Bearer <token>"
```

## Environment Variables

See `.env.example` for the full list.

## Docker Build

```bash
docker build -t job-search-service .
docker tag job-search-service acrjobsearchfinal.azurecr.io/job-search-service:latest
docker push acrjobsearchfinal.azurecr.io/job-search-service:latest
```
