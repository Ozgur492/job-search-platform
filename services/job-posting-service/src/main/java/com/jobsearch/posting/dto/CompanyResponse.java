package com.jobsearch.posting.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

public record CompanyResponse(
        UUID id,
        String name,
        String logoUrl,
        String description,
        OffsetDateTime createdAt
) {}
