package com.jobsearch.posting.dto;

import com.jobsearch.posting.entity.enums.WorkPreference;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateJobAlertRequest(
        @NotBlank @Size(max = 500) String keywords,
        @Size(max = 100) String country,
        @Size(max = 100) String city,
        @Size(max = 100) String town,
        WorkPreference workPreference
) {}
