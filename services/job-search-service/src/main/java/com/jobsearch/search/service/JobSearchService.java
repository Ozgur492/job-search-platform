package com.jobsearch.search.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.jobsearch.search.dto.JobDto;
import com.jobsearch.search.dto.PageResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.redis.core.Cursor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ScanOptions;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class JobSearchService {

    private static final Logger log = LoggerFactory.getLogger(JobSearchService.class);

    private final RedisTemplate<String, Object> redisTemplate;
    private final WebClient jobPostingWebClient;
    private final ObjectMapper objectMapper;

    public JobSearchService(RedisTemplate<String, Object> redisTemplate,
                            WebClient jobPostingWebClient,
                            ObjectMapper objectMapper) {
        this.redisTemplate = redisTemplate;
        this.jobPostingWebClient = jobPostingWebClient;
        this.objectMapper = objectMapper;
    }

    public PageResponse<JobDto> searchJobs(String position, String city, String country,
                                            String town, String workPreference,
                                            String employmentType, int page, int size) {
        // Try Redis cache first via SCAN
        List<JobDto> cachedJobs = scanRedisForJobs();

        if (!cachedJobs.isEmpty()) {
            List<JobDto> filtered = filterJobs(cachedJobs, position, city, country, town, workPreference, employmentType);

            // Sort by postedAt DESC
            filtered.sort((a, b) -> {
                if (b.postedAt() == null && a.postedAt() == null) return 0;
                if (b.postedAt() == null) return -1;
                if (a.postedAt() == null) return 1;
                return b.postedAt().compareTo(a.postedAt());
            });

            long total = filtered.size();
            int start = page * size;
            int end = Math.min(start + size, filtered.size());
            List<JobDto> pageData = start < filtered.size() ? filtered.subList(start, end) : List.of();

            if (pageData.size() >= size || total > 0) {
                return new PageResponse<>(pageData, page, size, total);
            }
        }

        // Fallback to Job Posting Service REST API
        log.info("Cache miss or insufficient results, falling back to Job Posting Service REST API");
        return fetchFromJobPostingService(position, city, country, page, size);
    }

    public List<String> autocompletePositions(String query, int limit) {
        // Check Redis cache first
        String cacheKey = "autocomplete:positions:" + query.toLowerCase();
        Object cached = redisTemplate.opsForValue().get(cacheKey);
        if (cached != null) {
            try {
                return objectMapper.convertValue(cached, new TypeReference<List<String>>() {});
            } catch (Exception e) {
                log.debug("Failed to deserialize cached autocomplete", e);
            }
        }

        // Fallback: query Job Posting Service
        try {
            Map<String, Object> response = jobPostingWebClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/api/v1/jobs")
                            .queryParam("page", 0)
                            .queryParam("size", 50)
                            .build())
                    .retrieve()
                    .bodyToMono(new org.springframework.core.ParameterizedTypeReference<Map<String, Object>>() {})
                    .block();

            if (response != null && response.containsKey("data")) {
                List<Map<String, Object>> jobs = objectMapper.convertValue(
                        response.get("data"), new TypeReference<>() {});
                List<String> titles = jobs.stream()
                        .map(j -> (String) j.get("title"))
                        .filter(Objects::nonNull)
                        .filter(t -> t.toLowerCase().startsWith(query.toLowerCase()))
                        .distinct()
                        .limit(limit)
                        .collect(Collectors.toList());

                // Cache for 60 seconds
                redisTemplate.opsForValue().set(cacheKey, titles, java.time.Duration.ofSeconds(60));
                return titles;
            }
        } catch (Exception e) {
            log.error("Failed to fetch autocomplete from Job Posting Service", e);
        }

        return List.of();
    }

    public List<String> autocompleteCities(String query, int limit) {
        String cacheKey = "autocomplete:cities:" + query.toLowerCase();
        Object cached = redisTemplate.opsForValue().get(cacheKey);
        if (cached != null) {
            try {
                return objectMapper.convertValue(cached, new TypeReference<List<String>>() {});
            } catch (Exception e) {
                log.debug("Failed to deserialize cached autocomplete", e);
            }
        }

        try {
            Map<String, Object> response = jobPostingWebClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/api/v1/jobs")
                            .queryParam("page", 0)
                            .queryParam("size", 50)
                            .build())
                    .retrieve()
                    .bodyToMono(new org.springframework.core.ParameterizedTypeReference<Map<String, Object>>() {})
                    .block();

            if (response != null && response.containsKey("data")) {
                List<Map<String, Object>> jobs = objectMapper.convertValue(
                        response.get("data"), new TypeReference<>() {});
                List<String> cities = jobs.stream()
                        .map(j -> (String) j.get("city"))
                        .filter(Objects::nonNull)
                        .filter(c -> c.toLowerCase().startsWith(query.toLowerCase()))
                        .distinct()
                        .limit(limit)
                        .collect(Collectors.toList());

                redisTemplate.opsForValue().set(cacheKey, cities, java.time.Duration.ofSeconds(60));
                return cities;
            }
        } catch (Exception e) {
            log.error("Failed to fetch city autocomplete from Job Posting Service", e);
        }

        return List.of();
    }

    private List<JobDto> scanRedisForJobs() {
        List<JobDto> jobs = new ArrayList<>();
        try {
            ScanOptions options = ScanOptions.scanOptions().match("jobs::*").count(100).build();
            Cursor<byte[]> cursor = redisTemplate.getConnectionFactory()
                    .getConnection().keyCommands().scan(options);

            while (cursor.hasNext()) {
                String key = new String(cursor.next());
                Object value = redisTemplate.opsForValue().get(key);
                if (value != null) {
                    try {
                        JobDto job = objectMapper.convertValue(value, JobDto.class);
                        jobs.add(job);
                    } catch (Exception e) {
                        log.debug("Failed to deserialize job from Redis key: {}", key, e);
                    }
                }
            }
            cursor.close();
        } catch (Exception e) {
            log.warn("Failed to scan Redis for jobs", e);
        }
        return jobs;
    }

    private List<JobDto> filterJobs(List<JobDto> jobs, String position, String city,
                                     String country, String town, String workPreference,
                                     String employmentType) {
        return jobs.stream()
                .filter(j -> j.isActive() == null || j.isActive())
                .filter(j -> position == null || position.isBlank() ||
                        (j.title() != null && j.title().toLowerCase().contains(position.toLowerCase())))
                .filter(j -> city == null || city.isBlank() ||
                        (j.city() != null && j.city().equalsIgnoreCase(city)))
                .filter(j -> country == null || country.isBlank() ||
                        (j.country() != null && j.country().equalsIgnoreCase(country)))
                .filter(j -> town == null || town.isBlank() ||
                        (j.town() != null && j.town().equalsIgnoreCase(town)))
                .filter(j -> workPreference == null || workPreference.isBlank() ||
                        (j.workPreference() != null && j.workPreference().equalsIgnoreCase(workPreference)))
                .filter(j -> employmentType == null || employmentType.isBlank() ||
                        (j.employmentType() != null && j.employmentType().equalsIgnoreCase(employmentType)))
                .collect(Collectors.toList());
    }

    @SuppressWarnings("unchecked")
    private PageResponse<JobDto> fetchFromJobPostingService(String position, String city,
                                                             String country, int page, int size) {
        try {
            Map<String, Object> response = jobPostingWebClient.get()
                    .uri(uriBuilder -> {
                        var builder = uriBuilder.path("/api/v1/jobs")
                                .queryParam("page", page)
                                .queryParam("size", size);
                        if (city != null && !city.isBlank()) builder.queryParam("city", city);
                        if (country != null && !country.isBlank()) builder.queryParam("country", country);
                        return builder.build();
                    })
                    .retrieve()
                    .bodyToMono(new org.springframework.core.ParameterizedTypeReference<Map<String, Object>>() {})
                    .block();

            if (response != null) {
                List<JobDto> data = objectMapper.convertValue(
                        response.get("data"), new TypeReference<List<JobDto>>() {});

                // Client-side filter by position if needed
                if (position != null && !position.isBlank()) {
                    data = data.stream()
                            .filter(j -> j.title() != null && j.title().toLowerCase().contains(position.toLowerCase()))
                            .collect(Collectors.toList());
                }

                int total = response.containsKey("total") ? ((Number) response.get("total")).intValue() : data.size();
                return new PageResponse<>(data, page, size, total);
            }
        } catch (Exception e) {
            log.error("Failed to fetch jobs from Job Posting Service", e);
        }

        return new PageResponse<>(List.of(), page, size, 0);
    }
}
