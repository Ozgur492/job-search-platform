package com.jobsearch.posting.controller;

import com.jobsearch.posting.dto.*;
import com.jobsearch.posting.entity.AppUser;
import com.jobsearch.posting.service.ApplicationService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/users")
public class UserController {

    private final ApplicationService applicationService;

    public UserController(ApplicationService applicationService) {
        this.applicationService = applicationService;
    }

    @GetMapping("/me/applications")
    public ResponseEntity<PageResponse<ApplicationResponse>> getMyApplications(
            HttpServletRequest httpRequest,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        AppUser user = (AppUser) httpRequest.getAttribute("currentUser");
        size = Math.min(size, 100);
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "appliedAt"));
        return ResponseEntity.ok(applicationService.getMyApplications(user.getId(), pageable));
    }
}
