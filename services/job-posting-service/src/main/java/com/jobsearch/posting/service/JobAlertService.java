package com.jobsearch.posting.service;

import com.jobsearch.posting.dto.*;
import com.jobsearch.posting.entity.AppUser;
import com.jobsearch.posting.entity.JobAlert;
import com.jobsearch.posting.repository.JobAlertRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class JobAlertService {

    private final JobAlertRepository jobAlertRepository;

    public JobAlertService(JobAlertRepository jobAlertRepository) {
        this.jobAlertRepository = jobAlertRepository;
    }

    @Transactional
    public JobAlertResponse create(CreateJobAlertRequest request, AppUser user) {
        JobAlert alert = new JobAlert();
        alert.setUser(user);
        alert.setKeywords(request.keywords());
        alert.setCountry(request.country());
        alert.setCity(request.city());
        alert.setTown(request.town());
        alert.setWorkPreference(request.workPreference());
        alert = jobAlertRepository.save(alert);
        return toResponse(alert);
    }

    @Transactional(readOnly = true)
    public List<JobAlertResponse> getByUserId(UUID userId) {
        return jobAlertRepository.findByUserId(userId).stream()
                .map(this::toResponse).toList();
    }

    @Transactional
    public void delete(UUID id, UUID userId) {
        JobAlert alert = jobAlertRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Job alert not found: " + id));
        if (!alert.getUser().getId().equals(userId)) {
            throw new SecurityException("Not authorized to delete this alert");
        }
        jobAlertRepository.delete(alert);
    }

    private JobAlertResponse toResponse(JobAlert a) {
        return new JobAlertResponse(
                a.getId(), a.getKeywords(), a.getCountry(), a.getCity(),
                a.getTown(), a.getWorkPreference(), a.getCreatedAt()
        );
    }
}
