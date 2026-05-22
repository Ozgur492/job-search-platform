package com.jobsearch.posting.repository;

import com.jobsearch.posting.entity.Job;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface JobRepository extends JpaRepository<Job, UUID> {

    Page<Job> findByIsActiveTrue(Pageable pageable);

    @Query("SELECT j FROM Job j WHERE j.isActive = true " +
            "AND (:companyId IS NULL OR j.company.id = :companyId) " +
            "AND (:city IS NULL OR j.city = :city) " +
            "AND (:country IS NULL OR j.country = :country)")
    Page<Job> findByFilters(
            @Param("companyId") UUID companyId,
            @Param("city") String city,
            @Param("country") String country,
            Pageable pageable);

    @Query(value = """
            SELECT * FROM jobs
            WHERE is_active = true
              AND id != :jobId
              AND city = :city
              AND (:title IS NULL OR 1=1)
            ORDER BY posted_at DESC
            LIMIT :lim
            """, nativeQuery = true)
    List<Job> findRelated(
            @Param("jobId") UUID jobId,
            @Param("city") String city,
            @Param("title") String title,
            @Param("lim") int limit);

    @Query(value = """
            SELECT DISTINCT title FROM jobs
            WHERE is_active = true
              AND title ILIKE :prefix || '%'
            ORDER BY title
            LIMIT :lim
            """, nativeQuery = true)
    List<String> searchAutocompleteTitles(
            @Param("prefix") String prefix,
            @Param("lim") int limit);

    @Query(value = """
            SELECT DISTINCT city FROM jobs
            WHERE is_active = true
              AND city ILIKE :prefix || '%'
            ORDER BY city
            LIMIT :lim
            """, nativeQuery = true)
    List<String> searchAutocompleteCities(
            @Param("prefix") String prefix,
            @Param("lim") int limit);

    Page<Job> findByCompanyId(UUID companyId, Pageable pageable);
}
