package com.jobsearch.posting.controller;

import com.jobsearch.posting.dto.*;
import com.jobsearch.posting.entity.AppUser;
import com.jobsearch.posting.entity.enums.Role;
import com.jobsearch.posting.service.ApplicationService;
import com.jobsearch.posting.service.JobService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/jobs")
public class JobController {

    private final JobService jobService;
    private final ApplicationService applicationService;

    public JobController(JobService jobService, ApplicationService applicationService) {
        this.jobService = jobService;
        this.applicationService = applicationService;
    }

    @PostMapping
    public ResponseEntity<JobResponse> create(@Valid @RequestBody CreateJobRequest request,
                                               HttpServletRequest httpRequest) {
        AppUser user = (AppUser) httpRequest.getAttribute("currentUser");
        // Ownership check: COMPANY users can only create jobs for their own company
        if (user.getRole() == Role.COMPANY && !user.getCompany().getId().equals(request.companyId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(jobService.create(request));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<JobResponse> update(@PathVariable UUID id,
                                               @Valid @RequestBody UpdateJobRequest request,
                                               HttpServletRequest httpRequest) {
        AppUser user = (AppUser) httpRequest.getAttribute("currentUser");
        if (user.getRole() == Role.COMPANY) {
            var job = jobService.getEntityById(id);
            if (!job.getCompany().getId().equals(user.getCompany().getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
        }
        return ResponseEntity.ok(jobService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id, HttpServletRequest httpRequest) {
        AppUser user = (AppUser) httpRequest.getAttribute("currentUser");
        if (user.getRole() == Role.COMPANY) {
            var job = jobService.getEntityById(id);
            if (!job.getCompany().getId().equals(user.getCompany().getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
        }
        jobService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<JobResponse> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(jobService.getById(id));
    }

    @GetMapping
    public ResponseEntity<PageResponse<JobResponse>> list(
            @RequestParam(required = false) UUID companyId,
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String country,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        size = Math.min(size, 100);
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "postedAt"));
        return ResponseEntity.ok(jobService.list(companyId, city, country, pageable));
    }

    @GetMapping("/{id}/related")
    public ResponseEntity<List<JobResponse>> getRelated(@PathVariable UUID id,
                                                         @RequestParam(defaultValue = "3") int limit) {
        return ResponseEntity.ok(jobService.getRelated(id, limit));
    }

    @PostMapping("/{id}/applications")
    public ResponseEntity<ApplicationResponse> apply(@PathVariable UUID id, HttpServletRequest httpRequest) {
        AppUser user = (AppUser) httpRequest.getAttribute("currentUser");
        return ResponseEntity.status(HttpStatus.CREATED).body(applicationService.apply(id, user));
    }

    @GetMapping("/{id}/applications/count")
    public ResponseEntity<Map<String, Long>> getApplicationCount(@PathVariable UUID id) {
        return ResponseEntity.ok(Map.of("count", applicationService.countByJobId(id)));
    }
}
