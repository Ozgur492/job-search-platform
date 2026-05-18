# API Gateway

Spring Cloud Gateway service that routes all frontend traffic to the appropriate backend microservice.

## Routes

| Path | Target |
|---|---|
| `/api/v1/jobs/**`, `/api/v1/companies/**`, `/api/v1/job-alerts/**`, `/api/v1/users/**` | job-posting-service:8081 |
| `/api/v1/search/**` | job-search-service:8082 |
| `/api/v1/notifications/**` | notification-service:8083 |
| `/api/v1/agent/**` | ai-agent-service:8084 |

## Tech Stack

- Spring Cloud Gateway 4.x
- Java 21
- Port: 8080

## Status

Placeholder — implementation in Phase 2.
