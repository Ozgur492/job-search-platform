package com.jobsearch.posting.dto;

import com.jobsearch.posting.entity.enums.EmploymentType;
import com.jobsearch.posting.entity.enums.PositionLevel;
import com.jobsearch.posting.entity.enums.WorkPreference;

import java.io.Serializable;
import java.time.OffsetDateTime;
import java.util.UUID;

public record JobResponse(
        UUID id,
        UUID companyId,
        String companyName,
        String title,
        String description,
        String country,
        String city,
        String town,
        WorkPreference workPreference,
        EmploymentType employmentType,
        PositionLevel positionLevel,
        String department,
        Integer salaryMin,
        Integer salaryMax,
        String currency,
        Boolean isActive,
        OffsetDateTime postedAt,
        OffsetDateTime updatedAt,
        OffsetDateTime expiresAt
) implements Serializable {}
