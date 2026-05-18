package com.jobsearch.posting.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.io.Serializable;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "companies")
@Getter
@Setter
@NoArgsConstructor
public class Company implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(name = "logo_url", length = 500)
    private String logoUrl;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "created_at")
    private OffsetDateTime createdAt = OffsetDateTime.now();
}
