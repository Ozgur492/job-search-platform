package com.jobsearch.posting.controller;

import com.jobsearch.posting.dto.*;
import com.jobsearch.posting.service.CompanyService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/companies")
public class CompanyController {

    private final CompanyService companyService;

    public CompanyController(CompanyService companyService) {
        this.companyService = companyService;
    }

    @PostMapping
    public ResponseEntity<CompanyResponse> create(@Valid @RequestBody CreateCompanyRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(companyService.create(request));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<CompanyResponse> update(@PathVariable UUID id,
                                                   @Valid @RequestBody UpdateCompanyRequest request) {
        return ResponseEntity.ok(companyService.update(id, request));
    }

    @GetMapping("/{id}")
    public ResponseEntity<CompanyResponse> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(companyService.getById(id));
    }
}
