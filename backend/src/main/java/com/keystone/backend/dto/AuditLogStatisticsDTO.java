package com.keystone.backend.dto;

public record AuditLogStatisticsDTO(
        long totalAuditCount,
        long todayActions,
        long weeklyActions,
        long recentActivityCount,
        long loginCount,
        long userCreationCount,
        long orderCount,
        long settingsChangeCount
) {
}
