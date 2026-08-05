package com.keystone.backend.dto;

public record AuditLogFilterRequest(
        String query,
        String action,
        String module,
        String user,
        String role,
        String startDate,
        String endDate,
        Integer responseStatus,
        String status,
        Integer page,
        Integer size,
        String sortBy,
        String sortDirection
) {
}
