package com.jobsearch.search.controller;

import com.jobsearch.search.dto.JobDto;
import com.jobsearch.search.dto.PageResponse;
import com.jobsearch.search.model.SearchHistory;
import com.jobsearch.search.service.JobSearchService;
import com.jobsearch.search.service.SearchHistoryService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/search")
public class SearchController {

    private final JobSearchService jobSearchService;
    private final SearchHistoryService searchHistoryService;

    public SearchController(JobSearchService jobSearchService,
                             SearchHistoryService searchHistoryService) {
        this.jobSearchService = jobSearchService;
        this.searchHistoryService = searchHistoryService;
    }

    @GetMapping("/jobs")
    public ResponseEntity<PageResponse<JobDto>> searchJobs(
            @RequestParam(required = false) String position,
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String country,
            @RequestParam(required = false) String town,
            @RequestParam(required = false) String workPreference,
            @RequestParam(required = false) String employmentType,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            HttpServletRequest httpRequest) {

        size = Math.min(size, 100);

        PageResponse<JobDto> result = jobSearchService.searchJobs(
                position, city, country, town, workPreference, employmentType, page, size);

        // Record search history asynchronously if user is authenticated
        @SuppressWarnings("unchecked")
        Map<String, Object> firebaseUser = (Map<String, Object>) httpRequest.getAttribute("firebaseUser");
        if (firebaseUser != null) {
            searchHistoryService.recordSearch(firebaseUser, position, city, country, town, workPreference);
        }

        return ResponseEntity.ok(result);
    }

    @GetMapping("/autocomplete/positions")
    public ResponseEntity<List<String>> autocompletePositions(
            @RequestParam String q,
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(jobSearchService.autocompletePositions(q, limit));
    }

    @GetMapping("/autocomplete/cities")
    public ResponseEntity<List<String>> autocompleteCities(
            @RequestParam String q,
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(jobSearchService.autocompleteCities(q, limit));
    }

    @GetMapping("/recent")
    public ResponseEntity<List<SearchHistory>> getRecentSearches(HttpServletRequest httpRequest) {
        @SuppressWarnings("unchecked")
        Map<String, Object> firebaseUser = (Map<String, Object>) httpRequest.getAttribute("firebaseUser");
        if (firebaseUser == null) {
            return ResponseEntity.status(401).build();
        }
        String userId = (String) firebaseUser.get("uid");
        return ResponseEntity.ok(searchHistoryService.getRecentSearches(userId));
    }
}
