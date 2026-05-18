package com.jobsearch.posting.entity;

import com.jobsearch.posting.entity.enums.Role;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.io.Serializable;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
public class AppUser implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "firebase_uid", unique = true, nullable = false, length = 128)
    private String firebaseUid;

    @Column(nullable = false, length = 255)
    private String email;

    @Column(name = "display_name", length = 200)
    private String displayName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Role role = Role.USER;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id")
    private Company company;

    @Column(length = 100)
    private String city;

    @Column(length = 100)
    private String country;

    @Column(name = "created_at")
    private OffsetDateTime createdAt = OffsetDateTime.now();
}
