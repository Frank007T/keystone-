package com.keystone.backend.dto;

import java.time.Instant;

public record AuditLogDTO(
        Long id,
        String action,
        String module,
        String entityType,
        String entityId,
        String description,
        Long performedByUserId,
        String performedByName,
        String performedByEmail,
        String role,
        String ipAddress,
        String browser,
        String operatingSystem,
        String endpoint,
        String httpMethod,
        String requestBody,
        Integer responseStatus,
        String status,
        Instant createdAt
) {
}
