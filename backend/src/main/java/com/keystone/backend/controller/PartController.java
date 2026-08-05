package com.keystone.backend.controller;

import com.keystone.backend.dto.PartRequest;
import com.keystone.backend.dto.PartResponse;
import com.keystone.backend.service.PartService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/parts")
@CrossOrigin(origins = "*") // Adjust origin per CORS configuration
public class PartController {

    private final PartService partService;

    public PartController(PartService partService) {
        this.partService = partService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('MANAGER', 'DISPATCHER', 'TECHNICIAN')")
    public ResponseEntity<Page<PartResponse>> getAllParts(
            @RequestParam(required = false) String search,
            @PageableDefault(size = 10, sort = "name") Pageable pageable) {
        return ResponseEntity.ok(partService.getAllParts(search, pageable));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('MANAGER', 'DISPATCHER', 'TECHNICIAN')")
    public ResponseEntity<PartResponse> getPartById(@PathVariable Long id) {
        return ResponseEntity.ok(partService.getPartById(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    public ResponseEntity<PartResponse> createPart(@Valid @RequestBody PartRequest request) {
        PartResponse createdPart = partService.createPart(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdPart);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    public ResponseEntity<PartResponse> updatePart(
            @PathVariable Long id,
            @Valid @RequestBody PartRequest request) {
        return ResponseEntity.ok(partService.updatePart(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    public ResponseEntity<Void> deletePart(@PathVariable Long id) {
        partService.deletePart(id);
        return ResponseEntity.noContent().build();
    }
}