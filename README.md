# Job Search Platform

A kariyer.net-style job search platform built as a distributed microservice system for the SE4458 Software Architecture course.

## Team

| Name | Student ID | Role |
|---|---|---|
| Özgür Can Güngör | 21070001058 | Lead Developer |
| Yağız Yungul | — | Partner |

**Course:** SE4458 — Software Architecture & Design of Modern Large Scale Systems

## Architecture

```mermaid
graph LR
    subgraph Client
        FE["React Frontend"]
    end

    subgraph Gateway
        GW["API Gateway :8080"]
    end

    subgraph Services
        JPS["Job Posting :8081"]
        JSS["Job Search :8082"]
        NS["Notification :8083"]
        AIS["AI Agent :8084"]
    end

    subgraph Data
        PG[(PostgreSQL)]
        RD[(Redis)]
        MG[(MongoDB)]
    end

    subgraph External
        FB["Firebase Auth"]
        SB["Service Bus"]
        CL["Claude API"]
    end

    FE --> GW
    GW --> JPS & JSS & NS & AIS
    JPS --> PG & RD & SB
    JSS --> RD & MG
    NS --> MG & PG & SB
    AIS --> CL
```

## Deployed URLs

| Component | URL |
|---|---|
| Frontend | _to be deployed_ |
| API Gateway | _to be deployed_ |
| Swagger UI (Job Posting) | _to be deployed_ |
| Swagger UI (Job Search) | _to be deployed_ |

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Vite + React 19 + TypeScript + Tailwind CSS |
| API Gateway | Spring Cloud Gateway 4.x (Java 21) |
| Backend (Java) | Spring Boot 3.3 + Spring Data JPA + Redis |
| Backend (Node) | Node 20 + Express 4 + Anthropic SDK + MCP SDK |
| Relational DB | PostgreSQL 16 (Azure Flexible Server) |
| Cache | Redis 7 (Azure Cache for Redis) |
| NoSQL | MongoDB (Azure Cosmos DB, Mongo API) |
| Queue | Azure Service Bus |
| Auth | Firebase Authentication |
| AI | Claude API (claude-opus-4-7) |
| CI/CD | GitHub Actions |
| Hosting | Azure App Service (backend) + Vercel (frontend) |

## Local Development Quickstart

### Prerequisites

- Docker Desktop
- Java 21 (Temurin)
- Maven 3.9+
- Node 20+
- Azure CLI

### Steps

1. Clone and start data infrastructure:

```bash
git clone https://github.com/<username>/job-search-platform.git
cd job-search-platform
docker-compose up -d
```

2. Verify data services:

```bash
# PostgreSQL
psql -h localhost -U jobsearch -d jobsearch
# Password: devpass

# Redis
redis-cli ping
# Expected: PONG

# MongoDB
mongosh "mongodb://root:devpass@localhost:27017"
```

3. Start backend services (each in a separate terminal):

```bash
# Job Posting Service
cd services/job-posting-service
mvn spring-boot:run

# Job Search Service
cd services/job-search-service
mvn spring-boot:run

# Notification Service
cd services/notification-service
npm install && npm start

# AI Agent Service
cd services/ai-agent-service
npm install && npm start

# API Gateway
cd services/api-gateway
mvn spring-boot:run

# Frontend
cd frontend
npm install && npm run dev
```

## Repository Structure

```
job-search-platform/
├── README.md
├── docker-compose.yml
├── .github/workflows/
├── infrastructure/
│   ├── azure-setup.md
│   ├── firebase-setup.md
│   └── env.example
├── services/
│   ├── api-gateway/
│   ├── job-posting-service/
│   ├── job-search-service/
│   ├── notification-service/
│   └── ai-agent-service/
├── frontend/
└── docs/
    ├── er-diagram.md
    ├── architecture.md
    └── assumptions.md
```

## Phases

- [x] Phase 0 — Infrastructure, Repo & Local Dev Setup
- [ ] Phase 1 — Data Models & Job Posting Service
- [ ] Phase 2 — Job Search Service & API Gateway
- [ ] Phase 3 — Notification Service
- [ ] Phase 4 — AI Agent Service (MCP)
- [ ] Phase 5 — Frontend (React + Vite + TypeScript)
- [ ] Phase 6 — Deployment, CI/CD, README & Video

## Assumptions

See [docs/assumptions.md](docs/assumptions.md) for detailed design decisions.

Key assumptions:
- Firebase Auth for identity (free tier, 50k MAU)
- Azure Service Bus Basic for messaging
- GitHub Actions cron for scheduled tasks
- In-memory conversation store for the AI agent
- Geolocation fallback to Izmir

## Known Issues

_None yet — will be documented as they arise._

## Demo Video

_Link to be added after recording._

## License

[MIT](LICENSE)
