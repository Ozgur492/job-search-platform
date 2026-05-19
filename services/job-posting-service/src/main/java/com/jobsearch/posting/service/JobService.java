package com.jobsearch.posting.service;

import com.jobsearch.posting.dto.*;
import com.jobsearch.posting.entity.Company;
import com.jobsearch.posting.entity.Job;
import com.jobsearch.posting.repository.CompanyRepository;
import com.jobsearch.posting.repository.JobRepository;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class JobService {

    private final JobRepository jobRepository;
    private final CompanyRepository companyRepository;

    public JobService(JobRepository jobRepository, CompanyRepository companyRepository) {
        this.jobRepository = jobRepository;
        this.companyRepository = companyRepository;
    }

    @Transactional
    public JobResponse create(CreateJobRequest request) {
        Company company = companyRepository.findById(request.companyId())
                .orElseThrow(() -> new IllegalArgumentException("Company not found: " + request.companyId()));

        Job job = new Job();
        job.setCompany(company);
        job.setTitle(request.title());
        job.setDescription(request.description());
        job.setCountry(request.country());
        job.setCity(request.city());
        job.setTown(request.town());
        job.setWorkPreference(request.workPreference());
        job.setEmploymentType(request.employmentType());
        job.setPositionLevel(request.positionLevel());
        job.setDepartment(request.department());
        job.setSalaryMin(request.salaryMin());
        job.setSalaryMax(request.salaryMax());
        if (request.currency() != null) job.setCurrency(request.currency());
        job.setExpiresAt(request.expiresAt());

        job = jobRepository.save(job);
        return toResponse(job);
    }

    @Transactional
    @CacheEvict(value = "jobs", key = "#id")
    public JobResponse update(UUID id, UpdateJobRequest request) {
        Job job = jobRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Job not found: " + id));

        if (request.title() != null) job.setTitle(request.title());
        if (request.description() != null) job.setDescription(request.description());
        if (request.country() != null) job.setCountry(request.country());
        if (request.city() != null) job.setCity(request.city());
        if (request.town() != null) job.setTown(request.town());
        if (request.workPreference() != null) job.setWorkPreference(request.workPreference());
        if (request.employmentType() != null) job.setEmploymentType(request.employmentType());
        if (request.positionLevel() != null) job.setPositionLevel(request.positionLevel());
        if (request.department() != null) job.setDepartment(request.department());
        if (request.salaryMin() != null) job.setSalaryMin(request.salaryMin());
        if (request.salaryMax() != null) job.setSalaryMax(request.salaryMax());
        if (request.currency() != null) job.setCurrency(request.currency());
        if (request.isActive() != null) job.setIsActive(request.isActive());
        if (request.expiresAt() != null) job.setExpiresAt(request.expiresAt());
        job.setUpdatedAt(OffsetDateTime.now());

        job = jobRepository.save(job);
        return toResponse(job);
    }

    @Transactional
    @CacheEvict(value = "jobs", key = "#id")
    public void delete(UUID id) {
        if (!jobRepository.existsById(id)) {
            throw new IllegalArgumentException("Job not found: " + id);
        }
        jobRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    //@Cacheable(value = "jobs", key = "#id")
    public JobResponse getById(UUID id) {
        Job job = jobRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Job not found: " + id));
        return toResponse(job);
    }

    @Transactional(readOnly = true)
    public PageResponse<JobResponse> list(UUID companyId, String city, String country, Pageable pageable) {
        Page<Job> page = jobRepository.findByFilters(companyId, city, country, pageable);
        List<JobResponse> data = page.getContent().stream().map(this::toResponse).toList();
        return new PageResponse<>(data, page.getNumber(), page.getSize(), page.getTotalElements());
    }

    @Transactional(readOnly = true)
    public List<JobResponse> getRelated(UUID jobId, int limit) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new IllegalArgumentException("Job not found: " + jobId));
        return jobRepository.findRelated(jobId, job.getCity(), job.getTitle(), limit)
                .stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public PageResponse<JobResponse> listByCompany(UUID companyId, Pageable pageable) {
        Page<Job> page = jobRepository.findByCompanyId(companyId, pageable);
        List<JobResponse> data = page.getContent().stream().map(this::toResponse).toList();
        return new PageResponse<>(data, page.getNumber(), page.getSize(), page.getTotalElements());
    }

    public Job getEntityById(UUID id) {
        return jobRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Job not found: " + id));
    }

    private JobResponse toResponse(Job j) {
        return new JobResponse(
                j.getId(),
                j.getCompany().getId(),
                j.getCompany().getName(),
                j.getTitle(),
                j.getDescription(),
                j.getCountry(),
                j.getCity(),
                j.getTown(),
                j.getWorkPreference(),
                j.getEmploymentType(),
                j.getPositionLevel(),
                j.getDepartment(),
                j.getSalaryMin(),
                j.getSalaryMax(),
                j.getCurrency(),
                j.getIsActive(),
                j.getPostedAt(),
                j.getUpdatedAt(),
                j.getExpiresAt()
        );
    }
}
