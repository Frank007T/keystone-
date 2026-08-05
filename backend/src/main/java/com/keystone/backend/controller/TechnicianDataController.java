package com.keystone.backend.controller;

import com.keystone.backend.entity.TimeLogEntity;
import com.keystone.backend.entity.WorkOrderEntity;
import com.keystone.backend.repository.TimeLogRepository;
import com.keystone.backend.repository.WorkOrderRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/data/technician")
@CrossOrigin(origins = "*")
public class TechnicianDataController {

    private final WorkOrderRepository workOrderRepository;
    private final TimeLogRepository timeLogRepository;

    public TechnicianDataController(WorkOrderRepository workOrderRepository, TimeLogRepository timeLogRepository) {
        this.workOrderRepository = workOrderRepository;
        this.timeLogRepository = timeLogRepository;
    }

    private String getCurrentEmail() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getName() == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthorized.");
        }
        return auth.getName();
    }

    @GetMapping("/jobs")
    public ResponseEntity<List<WorkOrderDto>> getMyTechnicianJobs() {
        return ResponseEntity.ok(workOrderRepository.findByAssignedToEmail(getCurrentEmail()).stream().map(this::toWorkOrderDto).collect(Collectors.toList()));
    }

    @GetMapping("/time-logs")
    public ResponseEntity<List<TimeLogDto>> getMyTimeLogs() {
        return ResponseEntity.ok(timeLogRepository.findByTechnicianEmail(getCurrentEmail()).stream().map(this::toTimeLogDto).collect(Collectors.toList()));
    }

    private WorkOrderDto toWorkOrderDto(WorkOrderEntity workOrder) {
        return new WorkOrderDto(
                workOrder.getId(), workOrder.getTitle(), workOrder.getDescription(),
                workOrder.getSiteName(), workOrder.getCustomerEmail(), workOrder.getAssignedToEmail(),
                workOrder.getPriority(), workOrder.getStatus(),
                workOrder.getDueDate() != null ? workOrder.getDueDate().toString() : null,
                workOrder.getCreatedAt() != null ? workOrder.getCreatedAt().toString() : null
        );
    }

    private TimeLogDto toTimeLogDto(TimeLogEntity timeLog) {
        return new TimeLogDto(timeLog.getWorkOrderId(), timeLog.getTechnicianEmail(), timeLog.getStartTime().toString(), timeLog.getEndTime() == null ? null : timeLog.getEndTime().toString(), timeLog.getNotes());
    }

    public record WorkOrderDto(Long id, String title, String description, String siteName, String customerEmail, String assignedToEmail, String priority, String status, String dueDate, String createdAt) {}
    public record TimeLogDto(Long workOrderId, String technicianEmail, String startTime, String endTime, String notes) {}
}