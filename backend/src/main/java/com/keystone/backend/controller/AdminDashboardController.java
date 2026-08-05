package com.keystone.backend.controller;

import com.keystone.backend.annotation.AuditLog;
import com.keystone.backend.entity.Role;
import com.keystone.backend.entity.UserEntity;
import com.keystone.backend.entity.WorkOrderEntity;
import com.keystone.backend.repository.UserRepository;
import com.keystone.backend.repository.WorkOrderRepository;
import com.keystone.backend.service.AuditLogService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdminDashboardController {

    private final UserRepository userRepository;
    private final WorkOrderRepository workOrderRepository;
    private final AuditLogService auditLogService;

    public AdminDashboardController(UserRepository userRepository, WorkOrderRepository workOrderRepository, AuditLogService auditLogService) {
        this.userRepository = userRepository;
        this.workOrderRepository = workOrderRepository;
        this.auditLogService = auditLogService;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<DashboardResponse> getDashboard(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "5") int limit) {

        List<UserEntity> allUsers = userRepository.findAll();
        List<WorkOrderEntity> allRequests = workOrderRepository.findAll();

        long totalManagers = allUsers.stream().filter(u -> u.getRole() == Role.MANAGER).count();
        long totalDispatchers = allUsers.stream().filter(u -> u.getRole() == Role.DISPATCHER).count();
        long totalTechnicians = allUsers.stream().filter(u -> u.getRole() == Role.TECHNICIAN).count();
        long totalCustomers = allUsers.stream().filter(u -> u.getRole() == Role.CUSTOMER).count();
        int totalRequests = allRequests.size();

        Metrics metrics = new Metrics(
                totalManagers,
                totalDispatchers,
                totalTechnicians,
                totalRequests,
                12, 8, 10, 15
        );

        Distribution distribution = new Distribution(
                totalManagers,
                totalDispatchers,
                totalTechnicians,
                totalCustomers,
                allUsers.size()
        );

        List<RequestDto> requestDtos = allRequests.stream()
                .skip((long) (page - 1) * limit)
                .limit(limit)
                .map(r -> new RequestDto(
                        r.getId(),
                        r.getTitle() != null ? r.getTitle() : "Request #" + r.getId(),
                        r.getSiteName(),
                        r.getCustomerEmail(),
                        r.getPriority() != null ? r.getPriority() : "MEDIUM",
                        r.getStatus() != null ? r.getStatus() : "Pending"
                ))
                .collect(Collectors.toList());

        List<ActivityDto> activities = auditLogService.getLogs(new com.keystone.backend.dto.AuditLogFilterRequest(null, null, null, null, null, null, null, null, null, 1, 5, "createdAt", "DESC"))
                .content()
                .stream()
                .map(log -> new ActivityDto(
                        String.valueOf(log.id()),
                        log.description() != null ? log.description() : log.action(),
                        log.createdAt() != null ? log.createdAt().toString() : "Just now",
                        log.module()
                ))
                .collect(Collectors.toList());

        DashboardResponse response = new DashboardResponse(
                metrics,
                distribution,
                activities,
                requestDtos,
                totalRequests
        );

        return ResponseEntity.ok(response);
    }

    @GetMapping("/users")
    public ResponseEntity<List<UserAdminDto>> getAllUsers(
            @RequestParam(required = false, defaultValue = "all") String role) {

        List<UserEntity> usersList;

        if ("all".equalsIgnoreCase(role)) {
            usersList = userRepository.findAll();
        } else {
            try {
                Role enumRole = Role.valueOf(role.toUpperCase());
                usersList = userRepository.findByRole(enumRole);
            } catch (IllegalArgumentException e) {
                usersList = userRepository.findAll();
            }
        }

        List<UserAdminDto> response = usersList.stream()
                .map(user -> new UserAdminDto(
                        user.getFullName(),
                        user.getCompanyName(),
                        user.getEmail(),
                        user.getPhone(),
                        user.getRole() != null ? user.getRole().name().toLowerCase() : "",
                        user.isEnabled(),
                        user.getManagerEmail(),
                        user.getCreatedAt() != null ? user.getCreatedAt().toString() : ""
                ))
                .collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    @GetMapping("/requests")
    public ResponseEntity<List<RequestDto>> getAllRequests() {
        List<WorkOrderEntity> allRequests = workOrderRepository.findAll();
        List<RequestDto> requestDtos = allRequests.stream()
                .map(r -> new RequestDto(
                        r.getId(),
                        r.getTitle() != null ? r.getTitle() : "Request #" + r.getId(),
                        r.getSiteName(),
                        r.getCustomerEmail(),
                        r.getPriority() != null ? r.getPriority() : "MEDIUM",
                        r.getStatus() != null ? r.getStatus() : "Pending"
                ))
                .collect(Collectors.toList());

        return ResponseEntity.ok(requestDtos);
    }

    @DeleteMapping("/requests/{id}")
    @AuditLog(action = "DELETE_ORDER", module = "REQUEST", description = "Deleted a service request", entityType = "WORK_ORDER")
    public ResponseEntity<Void> deleteRequest(@PathVariable Long id) {
        WorkOrderEntity request = workOrderRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Request not found."));

        workOrderRepository.delete(request);
        return ResponseEntity.noContent().build();
    }

    // --- DTO RECORDS ---

    public record UserAdminDto(
            String fullName,
            String companyName,
            String email,
            String phone,
            String role,
            boolean enabled,
            String managerEmail,
            String createdAt
    ) {}

    public record Metrics(
            long totalManagers,
            long totalDispatchers,
            long totalTechnicians,
            long totalRequests,
            int managersGrowth,
            int dispatchersGrowth,
            int techniciansGrowth,
            int requestsGrowth
    ) {}

    public record Distribution(
            long managers,
            long dispatchers,
            long technicians,
            long customers,
            long total
    ) {}

    public record ActivityDto(
            String id,
            String message,
            String timestamp,
            String type
    ) {}

    public record RequestDto(
            Long id,
            String title,
            String siteName,
            String customerEmail,
            String priority,
            String status
    ) {}

    public record DashboardResponse(
            Metrics metrics,
            Distribution distribution,
            List<ActivityDto> activities,
            List<RequestDto> requests,
            int totalRequestCount
    ) {}
}