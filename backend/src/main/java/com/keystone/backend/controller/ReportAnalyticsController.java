package com.keystone.backend.controller;

import com.keystone.backend.dto.ReportAnalyticsDTOs;
import com.keystone.backend.service.ReportAnalyticsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/reports")
@CrossOrigin(origins = "*")
public class ReportAnalyticsController {

    private final ReportAnalyticsService reportAnalyticsService;

    public ReportAnalyticsController(ReportAnalyticsService reportAnalyticsService) {
        this.reportAnalyticsService = reportAnalyticsService;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<ReportAnalyticsDTOs.DashboardReportResponse> getDashboard(@ModelAttribute ReportAnalyticsDTOs.ReportFilter filter) {
        return ResponseEntity.ok(reportAnalyticsService.getDashboardReport(filter));
    }

    @GetMapping("/requests")
    public ResponseEntity<ReportAnalyticsDTOs.RequestSummaryResponse> getRequests(@ModelAttribute ReportAnalyticsDTOs.ReportFilter filter) {
        return ResponseEntity.ok(reportAnalyticsService.getRequestSummary(filter));
    }

    @GetMapping("/revenue")
    public ResponseEntity<ReportAnalyticsDTOs.RevenueReportResponse> getRevenue(@ModelAttribute ReportAnalyticsDTOs.ReportFilter filter) {
        return ResponseEntity.ok(reportAnalyticsService.getRevenueReport(filter));
    }

    @GetMapping("/manager-performance")
    public ResponseEntity<java.util.List<ReportAnalyticsDTOs.ManagerPerformanceItem>> getManagerPerformance(@ModelAttribute ReportAnalyticsDTOs.ReportFilter filter) {
        return ResponseEntity.ok(reportAnalyticsService.getManagerPerformance(filter));
    }

    @GetMapping("/team-allocation")
    public ResponseEntity<ReportAnalyticsDTOs.TeamAllocationResponse> getTeamAllocation(@ModelAttribute ReportAnalyticsDTOs.ReportFilter filter) {
        return ResponseEntity.ok(reportAnalyticsService.getTeamAllocation(filter));
    }

    @GetMapping("/sla")
    public ResponseEntity<ReportAnalyticsDTOs.SlaHealthResponse> getSla(@ModelAttribute ReportAnalyticsDTOs.ReportFilter filter) {
        return ResponseEntity.ok(reportAnalyticsService.getSlaHealth(filter));
    }

    @GetMapping("/zones")
    public ResponseEntity<java.util.List<ReportAnalyticsDTOs.ZoneAnalyticsItem>> getZones(@ModelAttribute ReportAnalyticsDTOs.ReportFilter filter) {
        return ResponseEntity.ok(reportAnalyticsService.getZoneAnalytics(filter));
    }
}
