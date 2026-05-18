# Assumptions

## Authentication

Firebase Authentication was chosen over AWS Cognito and Supabase Auth. Firebase provides a generous free tier (50,000 MAU), straightforward JWT verification on the server side via the Admin SDK, and native support for both Email/Password and Google sign-in with minimal configuration. The JWTs are RS256-signed and can be verified independently by each microservice without a centralized auth service.

## Database

PostgreSQL Flexible Server on Azure was selected as the relational database. It supports the `pg_trgm` extension needed for title autocomplete and is carried over from previous coursework (SE4453 midterm), reducing setup overhead. The Burstable B1ms SKU is the cheapest option that supports flexible server features.

## NoSQL Store

Azure Cosmos DB with MongoDB API was chosen as the NoSQL database for search history and notifications. The free tier provides 1,000 RU/s and 25 GB of storage at no cost. If the free tier is already consumed on the subscription, MongoDB Atlas free M0 is the documented fallback.

## Distributed Cache

Azure Cache for Redis (Basic C0) is used for caching job detail responses. The Job Posting Service writes to the cache with a 5-minute TTL, and both the Job Posting and Job Search services read from it. The Basic tier has no SLA but is sufficient for a university project.

## Message Queue

Azure Service Bus (Basic tier) was chosen over RabbitMQ and Azure Queue Storage. Service Bus provides dead-letter queues and peek-lock semantics that simplify the notification matching pipeline. The Basic tier costs less than $1/month for the expected message volume.

## Scheduler

GitHub Actions cron schedules trigger the notification service's batch endpoints via HTTP calls. This approach is free, requires no in-process scheduler, and is fully observable through GitHub's workflow run logs. The tradeoff is a minimum granularity of 5 minutes and potential delays during peak GitHub Actions load.

## AI Agent

The AI Agent uses Claude (claude-opus-4-7) via the Anthropic Node SDK. Conversation state is stored in an in-memory Map keyed by conversation ID. This is acceptable for a demo/grading scenario but would need Redis or MongoDB-backed persistence in production. The agent communicates in the user's language (Turkish or English) detected from the user message.

## MCP Implementation

The MCP (Model Context Protocol) server is hosted in-process within the AI Agent Service. Tool calls are dispatched manually rather than using the MCP SDK's transport layer directly with the Anthropic SDK. This approach is more portable across SDK versions and clearer for grading.

## Geolocation

The brief states "assume geolocation is accessible." The frontend attempts `navigator.geolocation` on mount and reverse-geocodes the result to a city name. If geolocation is denied or unavailable, the default city is set to "Izmir" as a reasonable fallback for a Turkish platform.

## Service Decomposition

The system uses a Java/Node split: Spring Boot for data-intensive services (Job Posting, Job Search, API Gateway) and Node/Express for the AI Agent (which requires the MCP Node SDK) and Notification Service (simpler event-driven workload). This split also enables parallel development by team members.

## Deployment

All backend services run as Docker containers on a single Azure App Service Plan (B1 Linux), keeping costs under $50/month. The frontend is deployed to Vercel for faster global delivery and simpler configuration compared to Azure Static Web Apps.

## Notifications

Notifications are persisted in MongoDB and retrievable via REST API. Real email/SMS delivery is out of scope per the project brief. The notification system logs matched alerts for grading visibility.

## Duplicate Suppression

Both notification types (JOB_ALERT and RELATED_JOB) implement duplicate suppression: no two notifications for the same (userId, jobId, type) combination within a 24-hour window.
