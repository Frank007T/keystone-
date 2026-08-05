package com.keystone.backend.controller;

import com.keystone.backend.dto.AuditLogDTO;
import com.keystone.backend.dto.AuditLogFilterRequest;
import com.keystone.backend.dto.AuditLogResponse;
import com.keystone.backend.dto.AuditLogStatisticsDTO;
import com.keystone.backend.service.AuditLogService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/audit-logs")
@PreAuthorize("hasAnyRole('SUPER_ADMIN','ADMIN')")
public class AuditLogController {

    private final AuditLogService auditLogService;

    public AuditLogController(AuditLogService auditLogService) {
        this.auditLogService = auditLogService;
    }

    @GetMapping
    public ResponseEntity<AuditLogResponse> getLogs(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) String action,
            @RequestParam(required = false) String module,
            @RequestParam(required = false) String user,
            @RequestParam(required = false) String role,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            @RequestParam(required = false) Integer responseStatus,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "20") Integer size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDirection) {
        AuditLogFilterRequest filter = new AuditLogFilterRequest(query, action, module, user, role, startDate, endDate, responseStatus, status, page, size, sortBy, sortDirection);
        return ResponseEntity.ok(auditLogService.getLogs(filter));
    }

    @GetMapping("/{id}")
    public ResponseEntity<AuditLogDTO> getLogById(@PathVariable Long id) {
        return auditLogService.getLogById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/statistics")
    public ResponseEntity<AuditLogStatisticsDTO> getStatistics() {
        return ResponseEntity.ok(auditLogService.getStatistics());
    }

    @PostMapping("/search")
    public ResponseEntity<AuditLogResponse> searchLogs(@RequestBody AuditLogFilterRequest request) {
        return ResponseEntity.ok(auditLogService.searchLogs(request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteLog(@PathVariable Long id) {
        auditLogService.deleteLog(id);
        return ResponseEntity.noContent().build();
    }
}
