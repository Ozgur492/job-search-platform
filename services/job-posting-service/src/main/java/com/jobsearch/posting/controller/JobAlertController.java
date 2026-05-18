package com.jobsearch.posting.controller;

import com.jobsearch.posting.dto.*;
import com.jobsearch.posting.entity.AppUser;
import com.jobsearch.posting.service.JobAlertService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/job-alerts")
public class JobAlertController {

    private final JobAlertService jobAlertService;

    public JobAlertController(JobAlertService jobAlertService) {
        this.jobAlertService = jobAlertService;
    }

    @PostMapping
    public ResponseEntity<JobAlertResponse> create(@Valid @RequestBody CreateJobAlertRequest request,
                                                    HttpServletRequest httpRequest) {
        AppUser user = (AppUser) httpRequest.getAttribute("currentUser");
        return ResponseEntity.status(HttpStatus.CREATED).body(jobAlertService.create(request, user));
    }

    @GetMapping
    public ResponseEntity<List<JobAlertResponse>> list(HttpServletRequest httpRequest) {
        AppUser user = (AppUser) httpRequest.getAttribute("currentUser");
        return ResponseEntity.ok(jobAlertService.getByUserId(user.getId()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id, HttpServletRequest httpRequest) {
        AppUser user = (AppUser) httpRequest.getAttribute("currentUser");
        jobAlertService.delete(id, user.getId());
        return ResponseEntity.noContent().build();
    }
}
