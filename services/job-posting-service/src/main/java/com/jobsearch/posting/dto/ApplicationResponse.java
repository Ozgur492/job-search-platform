package com.jobsearch.posting.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

public record ApplicationResponse(
        UUID id,
        UUID jobId,
        String jobTitle,
        String companyName,
        OffsetDateTime appliedAt
) {}
