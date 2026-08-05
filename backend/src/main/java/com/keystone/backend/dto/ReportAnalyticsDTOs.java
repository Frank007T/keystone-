package com.keystone.backend.dto;

import java.util.List;

public class ReportAnalyticsDTOs {
    public record ReportFilter(
            String range,
            String startDate,
            String endDate,
            Long zoneId,
            Long managerId,
            Long technicianId,
            String requestType,
            String status
    ) {}

    public record DashboardReportResponse(
            long totalUsers,
            long totalManagers,
            long totalDispatchers,
            long totalTechnicians,
            long activeUsers,
            long inactiveUsers,
            long pendingRequests,
            long completedRequests,
            long cancelledRequests,
            long openRequests,
            long closedRequests,
            long escalatedRequests,
            double averageResolutionTimeHours,
            double averageResponseTimeHours,
            double slaCompliancePercent,
            double customerSatisfaction,
            double revenue,
            long invoicesGenerated,
            double paymentsReceived,
            double collectionsPending,
            double growthComparedToLastMonth,
            long requestsCreatedToday,
            long requestsCompletedToday,
            long reopenedRequests,
            List<RequestCategoryItem> topRequestCategories,
            List<RecentActivityItem> recentActivities
    ) {}

    public record RequestCategoryItem(String name, long count) {}

    public record RequestSummaryResponse(
            long requestsCreatedToday,
            long requestsCompletedToday,
            long pendingRequests,
            double averageCompletionTimeHours,
            double averageAssignmentTimeHours,
            long reopenedRequests,
            List<RequestCategoryItem> topRequestCategories,
            List<PeakHourItem> peakHours,
            List<RecentActivityItem> recentActivities
    ) {}

    public record PeakHourItem(String hour, long count) {}

    public record RevenueReportResponse(
            double totalRevenue,
            double outstandingPayments,
            long invoices,
            double collections,
            double refunds,
            List<RevenuePointItem> dailyRevenue,
            List<RevenuePointItem> weeklyRevenue,
            List<RevenuePointItem> monthlyRevenue,
            List<RevenuePointItem> yearlyRevenue
    ) {}

    public record RevenuePointItem(String label, double value) {}

    public record ManagerPerformanceItem(
            String name,
            long assignedRequests,
            long completed,
            long pending,
            long cancelled,
            double averageResolutionTimeHours,
            double customerRating,
            double efficiencyPercent,
            double completionPercent,
            long ranking
    ) {}

    public record TeamAllocationResponse(
            long managersAvailable,
            long dispatchersAvailable,
            long techniciansAvailable,
            long techniciansBusy,
            long techniciansOffline,
            double utilizationPercent,
            List<TeamStatusItem> overloadedTeams,
            List<TeamStatusItem> underutilizedTeams
    ) {}

    public record TeamStatusItem(String name, double value) {}

    public record SlaHealthResponse(
            long metSla,
            long breachedSla,
            long nearBreach,
            double averageSlaPercent,
            long criticalTickets,
            long escalations
    ) {}

    public record ZoneAnalyticsItem(
            String name,
            long requests,
            double revenue,
            double completionPercent,
            double averageTimeHours,
            long managerCount,
            long technicianCount
    ) {}

    public record RecentActivityItem(
            String time,
            String user,
            String action,
            String status
    ) {}
}
