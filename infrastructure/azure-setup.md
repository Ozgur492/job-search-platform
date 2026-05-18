# Azure Resource Provisioning Guide

All commands use the Azure CLI (`az`). Run them in order. Replace placeholder values where noted.

## Prerequisites

- Azure CLI installed and logged in: `az login`
- Target subscription: `8cbe7c6b-b7e5-4517-878d-3b2b11a5d2b2`

```bash
az account set --subscription 8cbe7c6b-b7e5-4517-878d-3b2b11a5d2b2
```

## 1. Resource Group

```bash
az group create \
  --name rg-jobsearch-final \
  --location switzerlandnorth
```

## 2. Azure Container Registry

```bash
az acr create \
  --resource-group rg-jobsearch-final \
  --name acrjobsearchfinal \
  --sku Basic \
  --admin-enabled true
```

Save the credentials:

```bash
az acr credential show --name acrjobsearchfinal
```

Expected output includes `username` and two passwords. Note the login server: `acrjobsearchfinal.azurecr.io`.

## 3. App Service Plan

```bash
az appservice plan create \
  --resource-group rg-jobsearch-final \
  --name asp-jobsearch-final \
  --sku B1 \
  --is-linux
```

## 4. Web Apps for Containers

Create one Web App per backend service, all on the same plan:

```bash
# API Gateway
az webapp create \
  --resource-group rg-jobsearch-final \
  --plan asp-jobsearch-final \
  --name wa-jobsearch-gateway \
  --deployment-container-image-name acrjobsearchfinal.azurecr.io/api-gateway:latest

# Job Posting Service
az webapp create \
  --resource-group rg-jobsearch-final \
  --plan asp-jobsearch-final \
  --name wa-jobsearch-posting \
  --deployment-container-image-name acrjobsearchfinal.azurecr.io/job-posting-service:latest

# Job Search Service
az webapp create \
  --resource-group rg-jobsearch-final \
  --plan asp-jobsearch-final \
  --name wa-jobsearch-search \
  --deployment-container-image-name acrjobsearchfinal.azurecr.io/job-search-service:latest

# Notification Service
az webapp create \
  --resource-group rg-jobsearch-final \
  --plan asp-jobsearch-final \
  --name wa-jobsearch-notification \
  --deployment-container-image-name acrjobsearchfinal.azurecr.io/notification-service:latest

# AI Agent Service
az webapp create \
  --resource-group rg-jobsearch-final \
  --plan asp-jobsearch-final \
  --name wa-jobsearch-agent \
  --deployment-container-image-name acrjobsearchfinal.azurecr.io/ai-agent-service:latest
```

Configure ACR authentication for each Web App:

```bash
for APP in wa-jobsearch-gateway wa-jobsearch-posting wa-jobsearch-search wa-jobsearch-notification wa-jobsearch-agent; do
  az webapp config container set \
    --resource-group rg-jobsearch-final \
    --name $APP \
    --docker-registry-server-url https://acrjobsearchfinal.azurecr.io \
    --docker-registry-server-user $(az acr credential show --name acrjobsearchfinal --query username -o tsv) \
    --docker-registry-server-password $(az acr credential show --name acrjobsearchfinal --query "passwords[0].value" -o tsv)
done
```

## 5. Azure Database for PostgreSQL Flexible Server

```bash
az postgres flexible-server create \
  --resource-group rg-jobsearch-final \
  --name pg-jobsearch-final \
  --location switzerlandnorth \
  --sku-name Standard_B1ms \
  --tier Burstable \
  --storage-size 32 \
  --version 16 \
  --admin-user jobsearchadmin \
  --admin-password '<REPLACE_WITH_STRONG_PASSWORD>' \
  --yes
```

Create the database:

```bash
az postgres flexible-server db create \
  --resource-group rg-jobsearch-final \
  --server-name pg-jobsearch-final \
  --database-name jobsearch
```

Allow Azure services:

```bash
az postgres flexible-server firewall-rule create \
  --resource-group rg-jobsearch-final \
  --name pg-jobsearch-final \
  --rule-name AllowAzureServices \
  --start-ip-address 0.0.0.0 \
  --end-ip-address 0.0.0.0
```

Connection string format:
```
jdbc:postgresql://pg-jobsearch-final.postgres.database.azure.com:5432/jobsearch?sslmode=require
```

## 6. Azure Cache for Redis

```bash
az redis create \
  --resource-group rg-jobsearch-final \
  --name redis-jobsearch-final \
  --location switzerlandnorth \
  --sku Basic \
  --vm-size C0
```

This takes 15-20 minutes. Retrieve keys:

```bash
az redis list-keys \
  --resource-group rg-jobsearch-final \
  --name redis-jobsearch-final
```

Connection details:
- Host: `redis-jobsearch-final.redis.cache.windows.net`
- Port: `6380` (SSL)
- Password: primary key from above

## 7. Azure Cosmos DB (MongoDB API, Free Tier)

```bash
az cosmosdb create \
  --resource-group rg-jobsearch-final \
  --name cosmos-jobsearch-final \
  --kind MongoDB \
  --server-version 7.0 \
  --enable-free-tier true \
  --locations regionName=switzerlandnorth failoverPriority=0
```

Create the database:

```bash
az cosmosdb mongodb database create \
  --resource-group rg-jobsearch-final \
  --account-name cosmos-jobsearch-final \
  --name jobsearch \
  --throughput 400
```

Retrieve the connection string:

```bash
az cosmosdb keys list \
  --resource-group rg-jobsearch-final \
  --name cosmos-jobsearch-final \
  --type connection-strings
```

Note: If free tier is already consumed on this subscription, use MongoDB Atlas free M0 cluster as a fallback.

## 8. Azure Service Bus

```bash
az servicebus namespace create \
  --resource-group rg-jobsearch-final \
  --name sb-jobsearch-final \
  --location switzerlandnorth \
  --sku Basic
```

Create the queues:

```bash
az servicebus queue create \
  --resource-group rg-jobsearch-final \
  --namespace-name sb-jobsearch-final \
  --name new-job-postings \
  --max-size 1024

az servicebus queue create \
  --resource-group rg-jobsearch-final \
  --namespace-name sb-jobsearch-final \
  --name new-reservations \
  --max-size 1024
```

Retrieve the connection string:

```bash
az servicebus namespace authorization-rule keys list \
  --resource-group rg-jobsearch-final \
  --namespace-name sb-jobsearch-final \
  --name RootManageSharedAccessKey \
  --query primaryConnectionString -o tsv
```

## Summary of Resources

| Resource | Name | SKU |
|---|---|---|
| Resource Group | rg-jobsearch-final | — |
| Container Registry | acrjobsearchfinal | Basic |
| App Service Plan | asp-jobsearch-final | B1 Linux |
| Web Apps (5) | wa-jobsearch-{gateway,posting,search,notification,agent} | — |
| PostgreSQL Flexible Server | pg-jobsearch-final | B1ms |
| Redis Cache | redis-jobsearch-final | Basic C0 |
| Cosmos DB (Mongo API) | cosmos-jobsearch-final | Free Tier |
| Service Bus | sb-jobsearch-final | Basic |

## Next Steps

After provisioning, set environment variables on each Web App using `az webapp config appsettings set`. See `env.example` for the full list per service.
