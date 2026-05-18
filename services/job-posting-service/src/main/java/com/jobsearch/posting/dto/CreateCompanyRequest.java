package com.jobsearch.posting.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateCompanyRequest(
        @NotBlank @Size(max = 200) String name,
        @Size(max = 500) String logoUrl,
        String description
) {}
