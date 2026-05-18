package com.jobsearch.posting.repository;

import com.jobsearch.posting.entity.Application;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface ApplicationRepository extends JpaRepository<Application, UUID> {
    Page<Application> findByUserId(UUID userId, Pageable pageable);

    long countByJobId(UUID jobId);

    boolean existsByJobIdAndUserId(UUID jobId, UUID userId);
}
