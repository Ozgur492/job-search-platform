package com.jobsearch.posting.service;

import com.jobsearch.posting.dto.*;
import com.jobsearch.posting.entity.Company;
import com.jobsearch.posting.repository.CompanyRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class CompanyService {

    private final CompanyRepository companyRepository;

    public CompanyService(CompanyRepository companyRepository) {
        this.companyRepository = companyRepository;
    }

    @Transactional
    public CompanyResponse create(CreateCompanyRequest request) {
        Company company = new Company();
        company.setName(request.name());
        company.setLogoUrl(request.logoUrl());
        company.setDescription(request.description());
        company = companyRepository.save(company);
        return toResponse(company);
    }

    @Transactional
    public CompanyResponse update(UUID id, UpdateCompanyRequest request) {
        Company company = companyRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Company not found: " + id));
        if (request.name() != null) company.setName(request.name());
        if (request.logoUrl() != null) company.setLogoUrl(request.logoUrl());
        if (request.description() != null) company.setDescription(request.description());
        company = companyRepository.save(company);
        return toResponse(company);
    }

    @Transactional(readOnly = true)
    public CompanyResponse getById(UUID id) {
        Company company = companyRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Company not found: " + id));
        return toResponse(company);
    }

    private CompanyResponse toResponse(Company c) {
        return new CompanyResponse(c.getId(), c.getName(), c.getLogoUrl(), c.getDescription(), c.getCreatedAt());
    }
}
