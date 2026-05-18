package com.jobsearch.posting.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.io.Serializable;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "applications", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"job_id", "user_id"})
})
@Getter
@Setter
@NoArgsConstructor
public class Application implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_id", nullable = false)
    private Job job;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private AppUser user;

    @Column(name = "applied_at")
    private OffsetDateTime appliedAt = OffsetDateTime.now();
}
