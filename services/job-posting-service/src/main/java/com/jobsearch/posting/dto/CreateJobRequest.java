package com.jobsearch.posting.dto;

import com.jobsearch.posting.entity.enums.EmploymentType;
import com.jobsearch.posting.entity.enums.PositionLevel;
import com.jobsearch.posting.entity.enums.WorkPreference;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.OffsetDateTime;
import java.util.UUID;

public record CreateJobRequest(
        @NotNull UUID companyId,
        @NotBlank @Size(max = 200) String title,
        @NotBlank String description,
        @NotBlank @Size(max = 100) String country,
        @NotBlank @Size(max = 100) String city,
        @Size(max = 100) String town,
        @NotNull WorkPreference workPreference,
        @NotNull EmploymentType employmentType,
        PositionLevel positionLevel,
        @Size(max = 100) String department,
        Integer salaryMin,
        Integer salaryMax,
        String currency,
        OffsetDateTime expiresAt
) {}
