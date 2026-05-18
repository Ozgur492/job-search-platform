package com.jobsearch.search.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Data
@Document(collection = "job_searches")
@CompoundIndex(name = "idx_userId_createdAt", def = "{'userId': 1, 'createdAt': -1}")
public class SearchHistory {

    @Id
    private String id;

    private String userId;

    private String firebaseUid;

    private SearchQuery query;

    @Indexed(expireAfter = "90d")
    private Instant createdAt = Instant.now();

    @Data
    public static class SearchQuery {
        private String position;
        private String city;
        private String country;
        private String town;
        private String workPreference;
    }
}
