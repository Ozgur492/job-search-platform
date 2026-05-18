package com.jobsearch.posting.dto;

import com.jobsearch.posting.entity.enums.WorkPreference;

import java.time.OffsetDateTime;
import java.util.UUID;

public record JobAlertResponse(
        UUID id,
        String keywords,
        String country,
        String city,
        String town,
        WorkPreference workPreference,
        OffsetDateTime createdAt
) {}
