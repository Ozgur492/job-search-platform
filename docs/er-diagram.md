# ER Diagram

```mermaid
erDiagram
    companies {
        UUID id PK
        VARCHAR name
        VARCHAR logo_url
        TEXT description
        TIMESTAMPTZ created_at
    }

    users {
        UUID id PK
        VARCHAR firebase_uid UK
        VARCHAR email
        VARCHAR display_name
        VARCHAR role
        UUID company_id FK
        VARCHAR city
        VARCHAR country
        TIMESTAMPTZ created_at
    }

    jobs {
        UUID id PK
        UUID company_id FK
        VARCHAR title
        TEXT description
        VARCHAR country
        VARCHAR city
        VARCHAR town
        VARCHAR work_preference
        VARCHAR employment_type
        VARCHAR position_level
        VARCHAR department
        INT salary_min
        INT salary_max
        VARCHAR currency
        BOOLEAN is_active
        TIMESTAMPTZ posted_at
        TIMESTAMPTZ updated_at
        TIMESTAMPTZ expires_at
    }

    applications {
        UUID id PK
        UUID job_id FK
        UUID user_id FK
        TIMESTAMPTZ applied_at
    }

    job_alerts {
        UUID id PK
        UUID user_id FK
        VARCHAR keywords
        VARCHAR country
        VARCHAR city
        VARCHAR town
        VARCHAR work_preference
        TIMESTAMPTZ created_at
    }

    companies ||--o{ users : "employs"
    companies ||--o{ jobs : "posts"
    users ||--o{ applications : "submits"
    jobs ||--o{ applications : "receives"
    users ||--o{ job_alerts : "creates"
```

## Notes

- `users.role` can be: `USER`, `ADMIN`, or `COMPANY`
- `jobs.work_preference` can be: `ONSITE`, `REMOTE`, or `HYBRID`
- `jobs.employment_type` can be: `FULL_TIME`, `PART_TIME`, `CONTRACT`, or `INTERN`
- `jobs.position_level` can be: `JUNIOR`, `MID`, `SENIOR`, `LEAD`, or `EXPERT`
- `applications` has a unique constraint on `(job_id, user_id)` to prevent duplicate applications
- `users.company_id` is nullable — only set for users with `COMPANY` role

## MongoDB Collections

The following collections exist in MongoDB (not shown in ER diagram):

### `job_searches`
- Stores recent search queries by authenticated users
- TTL index on `createdAt` (90 days auto-prune)

### `notifications`
- Stores job alert and related job notifications
- Types: `JOB_ALERT`, `RELATED_JOB`
