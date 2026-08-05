package com.keystone.backend.dto;

import java.util.List;

public record AuditLogResponse(
        List<AuditLogDTO> content,
        long totalElements,
        int totalPages,
        int page,
        int size
) {
}
