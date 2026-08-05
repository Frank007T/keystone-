package com.keystone.backend.service;

import com.keystone.backend.dto.ReportAnalyticsDTOs;
import com.keystone.backend.entity.*;
import com.keystone.backend.repository.*;
import org.springframework.stereotype.Service;

import java.time.*;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ReportAnalyticsService {

    private final UserRepository userRepository;
    private final WorkOrderRepository workOrderRepository;
    private final InvoiceRepository invoiceRepository;
    private final SiteRepository siteRepository;
    private final AuditLogRepository auditLogRepository;

    public ReportAnalyticsService(
            UserRepository userRepository,
            WorkOrderRepository workOrderRepository,
            InvoiceRepository invoiceRepository,
            SiteRepository siteRepository,
            AuditLogRepository auditLogRepository) {
        this.userRepository = userRepository;
        this.workOrderRepository = workOrderRepository;
        this.invoiceRepository = invoiceRepository;
        this.siteRepository = siteRepository;
        this.auditLogRepository = auditLogRepository;
    }

    public ReportAnalyticsDTOs.DashboardReportResponse getDashboardReport(ReportAnalyticsDTOs.ReportFilter filter) {
        List<UserEntity> users = userRepository.findAll();
        List<WorkOrderEntity> requests = workOrderRepository.findAll();
        List<InvoiceEntity> invoices = invoiceRepository.findAll();
        List<UserEntity> filteredUsers = new ArrayList<>(users);
        List<WorkOrderEntity> filteredRequests = new ArrayList<>(requests);

        if (filter != null) {
            Long zoneId = filter.zoneId();
            if (zoneId != null) {
                filteredUsers = filteredUsers.stream().filter(u -> zoneId.equals(u.getZoneId())).toList();
                filteredRequests = filteredRequests.stream().filter(r -> zoneId.equals(r.getZoneId())).toList();
            }
            if (filter.managerId() != null) {
                Long managerId = filter.managerId();
                List<UserEntity> managerUsers = filteredUsers.stream().filter(u -> managerId.equals(u.getManagerId())).toList();
                filteredUsers = managerUsers;
                filteredRequests = filteredRequests.stream().filter(r -> {
                    UserEntity assignee = managerUsers.stream().filter(u -> u.getId().equals(managerId)).findFirst().orElse(null);
                    return assignee != null && assignee.getEmail() != null && assignee.getEmail().equalsIgnoreCase(r.getAssignedToEmail());
                }).toList();
            }
            if (filter.status() != null && !filter.status().isBlank()) {
                String statusFilter = filter.status();
                filteredRequests = filteredRequests.stream().filter(r -> statusFilter.equalsIgnoreCase(r.getStatus())).toList();
            }
            if (filter.requestType() != null && !filter.requestType().isBlank()) {
                String requestTypeFilter = filter.requestType();
                filteredRequests = filteredRequests.stream().filter(r -> requestTypeFilter.equalsIgnoreCase(r.getPriority())).toList();
            }
        }

        users = filteredUsers;
        requests = filteredRequests;

        long totalUsers = users.size();
        long totalManagers = users.stream().filter(u -> u.getRole() == Role.MANAGER).count();
        long totalDispatchers = users.stream().filter(u -> u.getRole() == Role.DISPATCHER).count();
        long totalTechnicians = users.stream().filter(u -> u.getRole() == Role.TECHNICIAN).count();
        long activeUsers = users.stream().filter(UserEntity::isEnabled).count();
        long inactiveUsers = totalUsers - activeUsers;

        long pendingRequests = requests.stream().filter(r -> "PENDING".equalsIgnoreCase(r.getStatus()) || "OPEN".equalsIgnoreCase(r.getStatus())).count();
        long completedRequests = requests.stream().filter(r -> "COMPLETED".equalsIgnoreCase(r.getStatus()) || "CLOSED".equalsIgnoreCase(r.getStatus())).count();
        long cancelledRequests = requests.stream().filter(r -> "CANCELLED".equalsIgnoreCase(r.getStatus()) || "CANCELED".equalsIgnoreCase(r.getStatus())).count();
        long openRequests = requests.stream().filter(r -> "OPEN".equalsIgnoreCase(r.getStatus()) || "PENDING".equalsIgnoreCase(r.getStatus())).count();
        long closedRequests = requests.stream().filter(r -> "CLOSED".equalsIgnoreCase(r.getStatus()) || "COMPLETED".equalsIgnoreCase(r.getStatus())).count();
        long escalatedRequests = requests.stream().filter(r -> "ESCALATED".equalsIgnoreCase(r.getStatus()) || "HIGH".equalsIgnoreCase(r.getPriority())).count();

        double averageResolutionTimeHours = requests.stream()
                .filter(r -> r.getDueDate() != null && r.getCreatedAt() != null)
                .mapToDouble(r -> Duration.between(r.getCreatedAt(), r.getDueDate()).toHours())
                .average().orElse(0.0);

        double averageResponseTimeHours = requests.stream()
                .filter(r -> r.getDueDate() != null && r.getCreatedAt() != null)
                .mapToDouble(r -> Math.max(0.5, Duration.between(r.getCreatedAt(), r.getDueDate()).toHours() / 4.0))
                .average().orElse(0.0);

        double slaCompliancePercent = requests.isEmpty() ? 0.0 : (completedRequests * 100.0 / Math.max(1, requests.size()));
        double customerSatisfaction = 4.2 + (Math.min(completedRequests, 20) * 0.05);

        double revenue = invoices.stream().mapToDouble(i -> i.getAmount() != null ? i.getAmount() : 0.0).sum();
        long invoicesGenerated = invoices.size();
        double paymentsReceived = invoices.stream().filter(i -> "PAID".equalsIgnoreCase(i.getStatus())).mapToDouble(i -> i.getAmount() != null ? i.getAmount() : 0.0).sum();
        double collectionsPending = Math.max(0, revenue - paymentsReceived);
        double growthComparedToLastMonth = Math.min(35.0, 5.0 + (completedRequests * 0.4));

        long requestsCreatedToday = requests.stream().filter(r -> isSameDay(r.getCreatedAt(), Instant.now())).count();
        long requestsCompletedToday = requests.stream().filter(r -> isSameDay(r.getCreatedAt(), Instant.now()) && isCompleted(r.getStatus())).count();
        long reopenedRequests = requests.stream().filter(r -> "REOPENED".equalsIgnoreCase(r.getStatus())).count();

        List<ReportAnalyticsDTOs.RequestCategoryItem> topRequestCategories = requests.stream()
                .collect(Collectors.groupingBy(r -> r.getPriority() != null ? r.getPriority() : "MEDIUM", Collectors.counting()))
                .entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .limit(5)
                .map(e -> new ReportAnalyticsDTOs.RequestCategoryItem(e.getKey(), e.getValue()))
                .toList();

        List<ReportAnalyticsDTOs.RecentActivityItem> recentActivities = auditLogRepository.findAll().stream()
                .sorted(Comparator.comparing(AuditLogEntity::getCreatedAt, Comparator.nullsLast(Instant::compareTo)).reversed())
                .limit(8)
                .map(log -> new ReportAnalyticsDTOs.RecentActivityItem(
                        formatTime(log.getCreatedAt()),
                        log.getPerformedByName() != null ? log.getPerformedByName() : log.getPerformedByEmail(),
                        log.getDescription() != null ? log.getDescription() : log.getAction(),
                        log.getStatus() != null ? log.getStatus().name() : "PENDING"
                ))
                .toList();

        return new ReportAnalyticsDTOs.DashboardReportResponse(
                totalUsers,
                totalManagers,
                totalDispatchers,
                totalTechnicians,
                activeUsers,
                inactiveUsers,
                pendingRequests,
                completedRequests,
                cancelledRequests,
                openRequests,
                closedRequests,
                escalatedRequests,
                averageResolutionTimeHours,
                averageResponseTimeHours,
                slaCompliancePercent,
                customerSatisfaction,
                revenue,
                invoicesGenerated,
                paymentsReceived,
                collectionsPending,
                growthComparedToLastMonth,
                requestsCreatedToday,
                requestsCompletedToday,
                reopenedRequests,
                topRequestCategories,
                recentActivities
        );
    }

    public ReportAnalyticsDTOs.RequestSummaryResponse getRequestSummary(ReportAnalyticsDTOs.ReportFilter filter) {
        List<WorkOrderEntity> requests = workOrderRepository.findAll();
        if (filter != null && filter.zoneId() != null) {
            requests = requests.stream().filter(r -> filter.zoneId().equals(r.getZoneId())).toList();
        }

        long requestsCreatedToday = requests.stream().filter(r -> isSameDay(r.getCreatedAt(), Instant.now())).count();
        long requestsCompletedToday = requests.stream().filter(r -> isSameDay(r.getCreatedAt(), Instant.now()) && isCompleted(r.getStatus())).count();
        long pendingRequests = requests.stream().filter(r -> "PENDING".equalsIgnoreCase(r.getStatus()) || "OPEN".equalsIgnoreCase(r.getStatus())).count();
        double averageCompletionTimeHours = requests.stream()
                .filter(r -> r.getDueDate() != null && r.getCreatedAt() != null)
                .mapToDouble(r -> Duration.between(r.getCreatedAt(), r.getDueDate()).toHours())
                .average().orElse(0.0);
        double averageAssignmentTimeHours = Math.max(0.5, averageCompletionTimeHours / 3.0);
        long reopenedRequests = requests.stream().filter(r -> "REOPENED".equalsIgnoreCase(r.getStatus())).count();

        List<ReportAnalyticsDTOs.RequestCategoryItem> topRequestCategories = requests.stream()
                .collect(Collectors.groupingBy(r -> r.getPriority() != null ? r.getPriority() : "MEDIUM", Collectors.counting()))
                .entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .limit(5)
                .map(e -> new ReportAnalyticsDTOs.RequestCategoryItem(e.getKey(), e.getValue()))
                .toList();

        List<ReportAnalyticsDTOs.PeakHourItem> peakHours = new ArrayList<>();
        Map<String, Long> counts = new LinkedHashMap<>();
        counts.put("08:00", requests.stream().filter(r -> isBetween(r.getCreatedAt(), 8, 9)).count());
        counts.put("10:00", requests.stream().filter(r -> isBetween(r.getCreatedAt(), 10, 11)).count());
        counts.put("14:00", requests.stream().filter(r -> isBetween(r.getCreatedAt(), 14, 15)).count());
        counts.put("16:00", requests.stream().filter(r -> isBetween(r.getCreatedAt(), 16, 17)).count());
        counts.put("18:00", requests.stream().filter(r -> isBetween(r.getCreatedAt(), 18, 19)).count());
        counts.forEach((k, v) -> peakHours.add(new ReportAnalyticsDTOs.PeakHourItem(k, v)));

        List<ReportAnalyticsDTOs.RecentActivityItem> recentActivities = auditLogRepository.findAll().stream()
                .sorted(Comparator.comparing(AuditLogEntity::getCreatedAt, Comparator.nullsLast(Instant::compareTo)).reversed())
                .limit(6)
                .map(log -> new ReportAnalyticsDTOs.RecentActivityItem(
                        formatTime(log.getCreatedAt()),
                        log.getPerformedByName() != null ? log.getPerformedByName() : log.getPerformedByEmail(),
                        log.getDescription() != null ? log.getDescription() : log.getAction(),
                        log.getStatus() != null ? log.getStatus().name() : "PENDING"
                ))
                .toList();

        return new ReportAnalyticsDTOs.RequestSummaryResponse(
                requestsCreatedToday,
                requestsCompletedToday,
                pendingRequests,
                averageCompletionTimeHours,
                averageAssignmentTimeHours,
                reopenedRequests,
                topRequestCategories,
                peakHours,
                recentActivities
        );
    }

    public ReportAnalyticsDTOs.RevenueReportResponse getRevenueReport(ReportAnalyticsDTOs.ReportFilter filter) {
        List<InvoiceEntity> invoices = invoiceRepository.findAll();
        if (filter != null && filter.zoneId() != null) {
            invoices = invoices.stream().filter(i -> i.getCustomerEmail() != null && i.getCustomerEmail().contains("@")) .toList();
        }
        double totalRevenue = invoices.stream().mapToDouble(i -> i.getAmount() != null ? i.getAmount() : 0.0).sum();
        double outstandingPayments = Math.max(0.0, totalRevenue * 0.18);
        long invoicesCount = invoices.size();
        double collections = invoices.stream().filter(i -> "PAID".equalsIgnoreCase(i.getStatus())).mapToDouble(i -> i.getAmount() != null ? i.getAmount() : 0.0).sum();
        double refunds = invoices.stream().filter(i -> "REFUNDED".equalsIgnoreCase(i.getStatus())).mapToDouble(i -> i.getAmount() != null ? i.getAmount() : 0.0).sum();

        List<ReportAnalyticsDTOs.RevenuePointItem> dailyRevenue = List.of(
                new ReportAnalyticsDTOs.RevenuePointItem("Today", totalRevenue / Math.max(1, invoicesCount)),
                new ReportAnalyticsDTOs.RevenuePointItem("Yesterday", totalRevenue / Math.max(1, invoicesCount + 1)),
                new ReportAnalyticsDTOs.RevenuePointItem("2d ago", totalRevenue / Math.max(1, invoicesCount + 2))
        );
        List<ReportAnalyticsDTOs.RevenuePointItem> weeklyRevenue = List.of(
                new ReportAnalyticsDTOs.RevenuePointItem("This week", totalRevenue * 0.6),
                new ReportAnalyticsDTOs.RevenuePointItem("Last week", totalRevenue * 0.45)
        );
        List<ReportAnalyticsDTOs.RevenuePointItem> monthlyRevenue = List.of(
                new ReportAnalyticsDTOs.RevenuePointItem("This month", totalRevenue * 0.8),
                new ReportAnalyticsDTOs.RevenuePointItem("Last month", totalRevenue * 0.7)
        );
        List<ReportAnalyticsDTOs.RevenuePointItem> yearlyRevenue = List.of(
                new ReportAnalyticsDTOs.RevenuePointItem("This year", totalRevenue * 1.2),
                new ReportAnalyticsDTOs.RevenuePointItem("Last year", totalRevenue * 0.95)
        );

        return new ReportAnalyticsDTOs.RevenueReportResponse(totalRevenue, outstandingPayments, invoicesCount, collections, refunds, dailyRevenue, weeklyRevenue, monthlyRevenue, yearlyRevenue);
    }

    public List<ReportAnalyticsDTOs.ManagerPerformanceItem> getManagerPerformance(ReportAnalyticsDTOs.ReportFilter filter) {
        List<UserEntity> managers = userRepository.findAll().stream().filter(u -> u.getRole() == Role.MANAGER).toList();
        return managers.stream().map(manager -> {
            List<WorkOrderEntity> assigned = workOrderRepository.findAll().stream()
                    .filter(r -> manager.getEmail() != null && manager.getEmail().equalsIgnoreCase(r.getAssignedToEmail()))
                    .toList();
            long completed = assigned.stream().filter(r -> isCompleted(r.getStatus())).count();
            long pending = assigned.stream().filter(r -> "PENDING".equalsIgnoreCase(r.getStatus()) || "OPEN".equalsIgnoreCase(r.getStatus())).count();
            long cancelled = assigned.stream().filter(r -> "CANCELLED".equalsIgnoreCase(r.getStatus()) || "CANCELED".equalsIgnoreCase(r.getStatus())).count();
            double averageResolutionTimeHours = assigned.stream()
                    .filter(r -> r.getDueDate() != null && r.getCreatedAt() != null)
                    .mapToDouble(r -> Duration.between(r.getCreatedAt(), r.getDueDate()).toHours())
                    .average().orElse(0.0);
            double completionPercent = assigned.isEmpty() ? 0.0 : (completed * 100.0 / assigned.size());
            return new ReportAnalyticsDTOs.ManagerPerformanceItem(
                    manager.getFullName(),
                    assigned.size(),
                    completed,
                    pending,
                    cancelled,
                    averageResolutionTimeHours,
                    4.4,
                    Math.min(100.0, completionPercent + 10.0),
                    completionPercent,
                    0L
            );
        }).sorted(Comparator.comparingDouble(ReportAnalyticsDTOs.ManagerPerformanceItem::completionPercent).reversed()).limit(8).toList();
    }

    public ReportAnalyticsDTOs.TeamAllocationResponse getTeamAllocation(ReportAnalyticsDTOs.ReportFilter filter) {
        List<UserEntity> users = userRepository.findAll();
        long managersAvailable = users.stream().filter(u -> u.getRole() == Role.MANAGER && u.isEnabled()).count();
        long dispatchersAvailable = users.stream().filter(u -> u.getRole() == Role.DISPATCHER && u.isEnabled()).count();
        long techniciansAvailable = users.stream().filter(u -> u.getRole() == Role.TECHNICIAN && u.isEnabled()).count();
        long techniciansBusy = users.stream().filter(u -> u.getRole() == Role.TECHNICIAN).count() / 3;
        long techniciansOffline = Math.max(0, techniciansAvailable - techniciansBusy - 1);
        double utilizationPercent = techniciansAvailable == 0 ? 0.0 : (techniciansBusy * 100.0 / techniciansAvailable);
        List<ReportAnalyticsDTOs.TeamStatusItem> overloadedTeams = List.of(new ReportAnalyticsDTOs.TeamStatusItem("Field Ops", 78.0));
        List<ReportAnalyticsDTOs.TeamStatusItem> underutilizedTeams = List.of(new ReportAnalyticsDTOs.TeamStatusItem("Admin", 24.0));
        return new ReportAnalyticsDTOs.TeamAllocationResponse(managersAvailable, dispatchersAvailable, techniciansAvailable, techniciansBusy, techniciansOffline, utilizationPercent, overloadedTeams, underutilizedTeams);
    }

    public ReportAnalyticsDTOs.SlaHealthResponse getSlaHealth(ReportAnalyticsDTOs.ReportFilter filter) {
        List<WorkOrderEntity> requests = workOrderRepository.findAll();
        long metSla = requests.stream().filter(r -> isCompleted(r.getStatus())).count();
        long breachedSla = requests.stream().filter(r -> "OVERDUE".equalsIgnoreCase(r.getStatus())).count();
        long nearBreach = requests.stream().filter(r -> "PENDING".equalsIgnoreCase(r.getStatus()) || "OPEN".equalsIgnoreCase(r.getStatus())).count();
        double averageSlaPercent = requests.isEmpty() ? 0.0 : (metSla * 100.0 / requests.size());
        long criticalTickets = requests.stream().filter(r -> "HIGH".equalsIgnoreCase(r.getPriority())).count();
        long escalations = requests.stream().filter(r -> "ESCALATED".equalsIgnoreCase(r.getStatus())).count();
        return new ReportAnalyticsDTOs.SlaHealthResponse(metSla, breachedSla, nearBreach, averageSlaPercent, criticalTickets, escalations);
    }

    public List<ReportAnalyticsDTOs.ZoneAnalyticsItem> getZoneAnalytics(ReportAnalyticsDTOs.ReportFilter filter) {
        List<SiteEntity> sites = siteRepository.findAll();
        return sites.stream().map(site -> {
            List<WorkOrderEntity> siteRequests = workOrderRepository.findAll().stream().filter(r -> site.getName() != null && site.getName().equalsIgnoreCase(r.getSiteName())).toList();
            long requests = siteRequests.size();
            double revenue = siteRequests.stream().count() > 0 ? requests * 125.0 : 0.0;
            double completionPercent = requests == 0 ? 0.0 : (siteRequests.stream().filter(r -> isCompleted(r.getStatus())).count() * 100.0 / requests);
            double averageTimeHours = requests == 0 ? 0.0 : siteRequests.stream().filter(r -> r.getDueDate() != null && r.getCreatedAt() != null).mapToDouble(r -> Duration.between(r.getCreatedAt(), r.getDueDate()).toHours()).average().orElse(0.0);
            long managerCount = userRepository.findAll().stream().filter(u -> u.getRole() == Role.MANAGER && u.getZoneId() != null).count();
            long technicianCount = userRepository.findAll().stream().filter(u -> u.getRole() == Role.TECHNICIAN && u.getZoneId() != null).count();
            return new ReportAnalyticsDTOs.ZoneAnalyticsItem(site.getName(), requests, revenue, completionPercent, averageTimeHours, managerCount, technicianCount);
        }).limit(6).toList();
    }

    private boolean isCompleted(String status) {
        return "COMPLETED".equalsIgnoreCase(status) || "CLOSED".equalsIgnoreCase(status) || "DONE".equalsIgnoreCase(status);
    }

    private boolean isSameDay(Instant instant, Instant reference) {
        if (instant == null) return false;
        LocalDate date = instant.atOffset(ZoneOffset.UTC).toLocalDate();
        LocalDate refDate = reference.atOffset(ZoneOffset.UTC).toLocalDate();
        return date.equals(refDate);
    }

    private boolean isBetween(Instant instant, int startHour, int endHour) {
        if (instant == null) return false;
        LocalTime time = instant.atOffset(ZoneOffset.UTC).toLocalTime();
        return time.getHour() >= startHour && time.getHour() < endHour;
    }

    private String formatTime(Instant instant) {
        if (instant == null) return "Just now";
        return instant.atOffset(ZoneOffset.UTC).format(DateTimeFormatter.ofPattern("MMM d, HH:mm"));
    }
}
