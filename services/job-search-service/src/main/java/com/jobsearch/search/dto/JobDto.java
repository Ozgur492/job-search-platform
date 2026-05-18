package com.jobsearch.search.dto;

import java.io.Serializable;
import java.time.OffsetDateTime;
import java.util.UUID;

public record JobDto(
        UUID id,
        UUID companyId,
        String companyName,
        String title,
        String description,
        String country,
        String city,
        String town,
        String workPreference,
        String employmentType,
        String positionLevel,
        String department,
        Integer salaryMin,
        Integer salaryMax,
        String currency,
        Boolean isActive,
        OffsetDateTime postedAt,
        OffsetDateTime updatedAt,
        OffsetDateTime expiresAt
) implements Serializable {}
