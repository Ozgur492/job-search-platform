package com.jobsearch.posting.dto;

import com.jobsearch.posting.entity.enums.EmploymentType;
import com.jobsearch.posting.entity.enums.PositionLevel;
import com.jobsearch.posting.entity.enums.WorkPreference;

import java.time.OffsetDateTime;

public record UpdateJobRequest(
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
        OffsetDateTime expiresAt
) {}
