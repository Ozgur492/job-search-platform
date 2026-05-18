package com.jobsearch.posting.entity;

import com.jobsearch.posting.entity.enums.WorkPreference;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.io.Serializable;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "job_alerts")
@Getter
@Setter
@NoArgsConstructor
public class JobAlert implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private AppUser user;

    @Column(nullable = false, length = 500)
    private String keywords;

    @Column(length = 100)
    private String country;

    @Column(length = 100)
    private String city;

    @Column(length = 100)
    private String town;

    @Enumerated(EnumType.STRING)
    @Column(name = "work_preference", length = 20)
    private WorkPreference workPreference;

    @Column(name = "created_at")
    private OffsetDateTime createdAt = OffsetDateTime.now();
}
