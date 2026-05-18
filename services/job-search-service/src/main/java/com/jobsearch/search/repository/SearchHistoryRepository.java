package com.jobsearch.search.repository;

import com.jobsearch.search.model.SearchHistory;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface SearchHistoryRepository extends MongoRepository<SearchHistory, String> {
    List<SearchHistory> findTop10ByUserIdOrderByCreatedAtDesc(String userId);
}
