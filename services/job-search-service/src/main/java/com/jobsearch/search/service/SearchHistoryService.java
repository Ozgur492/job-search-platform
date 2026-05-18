package com.jobsearch.search.service;

import com.jobsearch.search.model.SearchHistory;
import com.jobsearch.search.repository.SearchHistoryRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class SearchHistoryService {

    private static final Logger log = LoggerFactory.getLogger(SearchHistoryService.class);

    private final SearchHistoryRepository searchHistoryRepository;

    public SearchHistoryService(SearchHistoryRepository searchHistoryRepository) {
        this.searchHistoryRepository = searchHistoryRepository;
    }

    /**
     * Asynchronously records a search query for an authenticated user.
     * Does not block the main search response.
     */
    @Async
    public void recordSearch(Map<String, Object> firebaseUser,
                              String position, String city, String country,
                              String town, String workPreference) {
        try {
            String uid = (String) firebaseUser.get("uid");

            SearchHistory history = new SearchHistory();
            history.setUserId(uid);
            history.setFirebaseUid(uid);

            SearchHistory.SearchQuery query = new SearchHistory.SearchQuery();
            query.setPosition(position);
            query.setCity(city);
            query.setCountry(country);
            query.setTown(town);
            query.setWorkPreference(workPreference);
            history.setQuery(query);

            searchHistoryRepository.save(history);
            log.debug("Recorded search history for user {}", uid);
        } catch (Exception e) {
            log.error("Failed to record search history", e);
        }
    }

    public List<SearchHistory> getRecentSearches(String userId) {
        return searchHistoryRepository.findTop10ByUserIdOrderByCreatedAtDesc(userId);
    }
}
