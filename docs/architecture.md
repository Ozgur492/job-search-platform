# Architecture

## System Overview

```mermaid
graph TB
    subgraph Client
        FE["Frontend<br/>(React + Vite)"]
    end

    subgraph "Azure App Service"
        GW["API Gateway<br/>(Spring Cloud Gateway)<br/>:8080"]
        JPS["Job Posting Service<br/>(Spring Boot)<br/>:8081"]
        JSS["Job Search Service<br/>(Spring Boot)<br/>:8082"]
        NS["Notification Service<br/>(Node/Express)<br/>:8083"]
        AIS["AI Agent Service<br/>(Node/Express)<br/>:8084"]
    end

    subgraph "Data Stores"
        PG["PostgreSQL 16"]
        RD["Redis 7"]
        MG["MongoDB<br/>(Cosmos DB)"]
    end

    subgraph "External Services"
        FB["Firebase Auth"]
        SB["Azure Service Bus"]
        CL["Claude API<br/>(Anthropic)"]
        GHA["GitHub Actions<br/>(Cron)"]
    end

    FE -->|HTTPS| GW
    GW --> JPS
    GW --> JSS
    GW --> NS
    GW --> AIS

    JPS --> PG
    JPS --> RD
    JPS --> SB

    JSS --> RD
    JSS --> MG
    JSS -->|REST fallback| JPS

    NS --> MG
    NS -->|read-only| PG
    NS --> SB
    NS -->|REST| JPS

    AIS -->|REST via GW| GW
    AIS --> CL

    FE --> FB
    JPS --> FB
    JSS --> FB
    NS --> FB

    GHA -->|POST /cron/*| NS
```

## Service Responsibilities

| Service | Responsibility |
|---|---|
| API Gateway | Routing, CORS, rate limiting, correlation ID |
| Job Posting Service | CRUD for companies, jobs, applications, job alerts |
| Job Search Service | Search, autocomplete, search history |
| Notification Service | Queue consumer, scheduled notifications |
| AI Agent Service | Chat interface with Claude tool use |

## Search-Detail-Apply Flow

```mermaid
sequenceDiagram
    actor U as User
    participant FE as Frontend
    participant GW as Gateway
    participant JSS as Job Search
    participant JPS as Job Posting
    participant FB as Firebase

    U->>FE: Search "Web Developer, Izmir"
    FE->>GW: GET /api/v1/search/jobs?position=Web+Developer&city=Izmir
    GW->>JSS: forward
    JSS->>JPS: GET /api/v1/jobs (cache miss fallback)
    JPS-->>JSS: paginated results
    JSS-->>GW: paginated results
    GW-->>FE: job list

    U->>FE: Click job card
    FE->>GW: GET /api/v1/jobs/{id}
    GW->>JPS: forward
    JPS-->>GW: job detail (from Redis cache)
    GW-->>FE: job detail

    U->>FE: Click "Basvur"
    FE->>FB: getIdToken()
    FB-->>FE: ID token
    FE->>GW: POST /api/v1/jobs/{id}/applications (Bearer token)
    GW->>JPS: forward
    JPS->>FB: verify token
    JPS->>JPS: create application
    JPS-->>GW: 201 Created
    GW-->>FE: success
    FE->>U: toast "Basvurunuz alindi"
```

## Agent Chat Flow

```mermaid
sequenceDiagram
    actor U as User
    participant FE as Frontend
    participant GW as Gateway
    participant AIS as AI Agent
    participant CL as Claude API

    U->>FE: "Izmir'de remote yazilim isleri bul"
    FE->>GW: POST /api/v1/agent/chat
    GW->>AIS: forward
    AIS->>CL: messages.create (with tools)
    CL-->>AIS: tool_use: search_jobs
    AIS->>GW: GET /api/v1/search/jobs?city=Izmir&workPreference=REMOTE
    GW-->>AIS: results
    AIS->>CL: tool_result
    CL-->>AIS: end_turn (formatted response)
    AIS-->>GW: assistant message + tool calls
    GW-->>FE: response
    FE->>U: Render job cards in chat
```
