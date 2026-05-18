package com.jobsearch.posting.service;

import com.jobsearch.posting.dto.*;
import com.jobsearch.posting.entity.AppUser;
import com.jobsearch.posting.entity.Application;
import com.jobsearch.posting.entity.Job;
import com.jobsearch.posting.repository.ApplicationRepository;
import com.jobsearch.posting.repository.JobRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final JobRepository jobRepository;

    public ApplicationService(ApplicationRepository applicationRepository, JobRepository jobRepository) {
        this.applicationRepository = applicationRepository;
        this.jobRepository = jobRepository;
    }

    @Transactional
    public ApplicationResponse apply(UUID jobId, AppUser user) {
        if (applicationRepository.existsByJobIdAndUserId(jobId, user.getId())) {
            throw new IllegalStateException("Already applied to this job");
        }

        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new IllegalArgumentException("Job not found: " + jobId));

        Application application = new Application();
        application.setJob(job);
        application.setUser(user);
        application = applicationRepository.save(application);

        return new ApplicationResponse(
                application.getId(),
                job.getId(),
                job.getTitle(),
                job.getCompany().getName(),
                application.getAppliedAt()
        );
    }

    @Transactional(readOnly = true)
    public PageResponse<ApplicationResponse> getMyApplications(UUID userId, Pageable pageable) {
        Page<Application> page = applicationRepository.findByUserId(userId, pageable);
        List<ApplicationResponse> data = page.getContent().stream()
                .map(a -> new ApplicationResponse(
                        a.getId(),
                        a.getJob().getId(),
                        a.getJob().getTitle(),
                        a.getJob().getCompany().getName(),
                        a.getAppliedAt()
                )).toList();
        return new PageResponse<>(data, page.getNumber(), page.getSize(), page.getTotalElements());
    }

    @Transactional(readOnly = true)
    public long countByJobId(UUID jobId) {
        return applicationRepository.countByJobId(jobId);
    }
}
