package com.jobsearch.posting.entity;

import com.jobsearch.posting.entity.enums.EmploymentType;
import com.jobsearch.posting.entity.enums.PositionLevel;
import com.jobsearch.posting.entity.enums.WorkPreference;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.io.Serializable;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "jobs")
@Getter
@Setter
@NoArgsConstructor
public class Job implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id", nullable = false)
    private Company company;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false, length = 100)
    private String country;

    @Column(nullable = false, length = 100)
    private String city;

    @Column(length = 100)
    private String town;

    @Enumerated(EnumType.STRING)
    @Column(name = "work_preference", nullable = false, length = 20)
    private WorkPreference workPreference;

    @Enumerated(EnumType.STRING)
    @Column(name = "employment_type", nullable = false, length = 20)
    private EmploymentType employmentType;

    @Enumerated(EnumType.STRING)
    @Column(name = "position_level", length = 20)
    private PositionLevel positionLevel;

    @Column(length = 100)
    private String department;

    @Column(name = "salary_min")
    private Integer salaryMin;

    @Column(name = "salary_max")
    private Integer salaryMax;

    @Column(length = 3)
    private String currency = "TRY";

    @Column(name = "is_active")
    private Boolean isActive = true;

    @Column(name = "posted_at")
    private OffsetDateTime postedAt = OffsetDateTime.now();

    @Column(name = "updated_at")
    private OffsetDateTime updatedAt = OffsetDateTime.now();

    @Column(name = "expires_at")
    private OffsetDateTime expiresAt;
}
