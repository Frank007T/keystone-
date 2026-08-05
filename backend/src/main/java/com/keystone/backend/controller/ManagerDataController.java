package com.keystone.backend.controller;

import com.keystone.backend.entity.Role;
import com.keystone.backend.entity.UserEntity;
import com.keystone.backend.entity.WorkOrderEntity;
import com.keystone.backend.repository.NotificationRepository;
import com.keystone.backend.repository.UserRepository;
import com.keystone.backend.repository.WorkOrderRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/data/manager")
@CrossOrigin(origins = "*")
public class ManagerDataController {

    private final UserRepository userRepository;
    private final WorkOrderRepository workOrderRepository;
    private final NotificationRepository notificationRepository;

    public ManagerDataController(
            UserRepository userRepository,
            WorkOrderRepository workOrderRepository,
            NotificationRepository notificationRepository) {
        this.userRepository = userRepository;
        this.workOrderRepository = workOrderRepository;
        this.notificationRepository = notificationRepository;
    }

    private UserEntity getAuthenticatedUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getName() == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthorized access.");
        }
        return userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
    }

    private UserEntity getAuthenticatedManager() {
        UserEntity user = getAuthenticatedUser();
        if (user.getRole() == Role.SUPER_ADMIN) {
            return user;
        }
        if (user.getZoneId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "User has no assigned zone.");
        }
        return user;
    }

    private UserDto toUserDto(UserEntity user) {
        return new UserDto(
                user.getId(),
                user.getFullName(),
                user.getCompanyName(),
                user.getEmail(),
                user.getPhone(),
                user.getRole() != null ? user.getRole().name().toLowerCase() : "",
                user.isEnabled(),
                user.getManagerEmail(),
                user.getZoneId(),
                user.getCreatedAt() != null ? user.getCreatedAt().toString() : ""
        );
    }

    private WorkOrderDto toWorkOrderDto(WorkOrderEntity workOrder) {
        return new WorkOrderDto(
                workOrder.getId(),
                workOrder.getTitle(),
                workOrder.getDescription(),
                workOrder.getSiteName(),
                workOrder.getCustomerEmail(),
                workOrder.getAssignedToEmail(),
                workOrder.getPriority(),
                workOrder.getStatus(),
                workOrder.getDueDate() == null ? null : workOrder.getDueDate().toString(),
                workOrder.getCreatedAt() == null ? null : workOrder.getCreatedAt().toString()
        );
    }

    // --- USER MANAGEMENT ---

    @GetMapping("/users")
    public ResponseEntity<List<UserDto>> getZoneUsers() {
        UserEntity manager = getAuthenticatedManager();
        List<UserEntity> users = (manager.getZoneId() == null)
                ? userRepository.findAll()
                : userRepository.findSubordinatesByZoneId(manager.getZoneId());
                
        return ResponseEntity.ok(users.stream().map(this::toUserDto).collect(Collectors.toList()));
    }

    @GetMapping("/customers")
    public ResponseEntity<List<UserDto>> getZoneCustomers() {
        UserEntity manager = getAuthenticatedManager();
        List<UserEntity> customers = (manager.getZoneId() == null)
                ? userRepository.findByRole(Role.CUSTOMER)
                : userRepository.findByZoneIdAndRole(manager.getZoneId(), Role.CUSTOMER);

        return ResponseEntity.ok(customers.stream().map(this::toUserDto).collect(Collectors.toList()));
    }

    @GetMapping("/technicians")
    public ResponseEntity<List<UserDto>> getZoneTechnicians() {
        UserEntity manager = getAuthenticatedManager();
        List<UserEntity> technicians = (manager.getZoneId() == null)
                ? userRepository.findByRole(Role.TECHNICIAN)
                : userRepository.findByZoneIdAndRole(manager.getZoneId(), Role.TECHNICIAN);

        return ResponseEntity.ok(technicians.stream().map(this::toUserDto).collect(Collectors.toList()));
    }

    @GetMapping("/dispatchers")
    public ResponseEntity<List<UserDto>> getZoneDispatchers() {
        UserEntity manager = getAuthenticatedManager();
        List<UserEntity> dispatchers = (manager.getZoneId() == null)
                ? userRepository.findByRole(Role.DISPATCHER)
                : userRepository.findByZoneIdAndRole(manager.getZoneId(), Role.DISPATCHER);

        return ResponseEntity.ok(dispatchers.stream().map(this::toUserDto).collect(Collectors.toList()));
    }

    // --- WORK ORDERS ---

    @GetMapping("/work-orders")
    public ResponseEntity<List<WorkOrderDto>> getManagerWorkOrders(@RequestParam(required = false) Long zoneId) {
        UserEntity user = getAuthenticatedUser();
        List<WorkOrderEntity> workOrders;

        if (zoneId != null) {
            workOrders = workOrderRepository.findByZoneId(zoneId);
        } else if (user.getRole() == Role.SUPER_ADMIN) {
            workOrders = workOrderRepository.findAll();
        } else {
            if (user.getZoneId() == null) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "User has no assigned zone.");
            }
            workOrders = workOrderRepository.findByZoneId(user.getZoneId());
        }

        return ResponseEntity.ok(workOrders.stream().map(this::toWorkOrderDto).collect(Collectors.toList()));
    }

    @PostMapping("/work-orders")
    public ResponseEntity<WorkOrderDto> createManagerWorkOrder(@RequestBody CreateManagerWorkOrderRequest request) {
        WorkOrderEntity workOrder = new WorkOrderEntity();
        workOrder.setTitle(request.title());
        workOrder.setDescription(request.description());
        workOrder.setSiteName(request.siteName());
        workOrder.setCustomerEmail(request.customerEmail());
        workOrder.setAssignedToEmail(request.assignedToEmail());
        workOrder.setPriority(request.priority() != null ? request.priority() : "MEDIUM");
        workOrder.setStatus(request.status() != null ? request.status() : "OPEN");

        if (request.dueDate() != null && !request.dueDate().isBlank()) {
            workOrder.setDueDate(Instant.parse(request.dueDate()));
        }

        return ResponseEntity.ok(toWorkOrderDto(workOrderRepository.save(workOrder)));
    }

    // DTO Records
    public record UserDto(Long id, String fullName, String companyName, String email, String phone, String role, boolean enabled, String managerEmail, Long zoneId, String createdAt) {}
    public record WorkOrderDto(Long id, String title, String description, String siteName, String customerEmail, String assignedToEmail, String priority, String status, String dueDate, String createdAt) {}
    public record CreateManagerWorkOrderRequest(String title, String description, String siteName, String customerEmail, String assignedToEmail, String priority, String status, String dueDate) {}
}