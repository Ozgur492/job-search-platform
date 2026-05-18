package com.jobsearch.posting.repository;

import com.jobsearch.posting.entity.JobAlert;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface JobAlertRepository extends JpaRepository<JobAlert, UUID> {
    List<JobAlert> findByUserId(UUID userId);
}
