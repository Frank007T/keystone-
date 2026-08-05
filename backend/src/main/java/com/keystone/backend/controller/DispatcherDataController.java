package com.keystone.backend.controller;

import com.keystone.backend.annotation.AuditLog;
import com.keystone.backend.entity.UserEntity;
import com.keystone.backend.entity.WorkOrderEntity;
import com.keystone.backend.repository.UserRepository;
import com.keystone.backend.repository.WorkOrderRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/data/dispatcher")
@CrossOrigin(origins = "*")
public class DispatcherDataController {

    private final WorkOrderRepository workOrderRepository;
    private final UserRepository userRepository;

    public DispatcherDataController(WorkOrderRepository workOrderRepository, UserRepository userRepository) {
        this.workOrderRepository = workOrderRepository;
        this.userRepository = userRepository;
    }

    @GetMapping("/work-orders")
    public ResponseEntity<List<WorkOrderDto>> getDispatcherWorkOrders() {
        return ResponseEntity.ok(
                workOrderRepository.findAll().stream()
                        .map(this::toWorkOrderDto)
                        .collect(Collectors.toList())
        );
    }

    @GetMapping("/technicians")
    public ResponseEntity<List<UserDto>> getDispatcherTechnicians() {
        List<UserDto> technicians = userRepository.findAll().stream()
                .filter(user -> user.getRole() != null && 
                        ("TECHNICIAN".equalsIgnoreCase(user.getRole().name()) || 
                         "ROLE_TECHNICIAN".equalsIgnoreCase(user.getRole().name())))
                .map(this::toUserDto)
                .collect(Collectors.toList());

        return ResponseEntity.ok(technicians);
    }

    @GetMapping("/customers")
    public ResponseEntity<List<UserDto>> getDispatcherCustomers() {
        List<UserDto> customers = userRepository.findAll().stream()
                .filter(user -> user.getRole() != null && 
                        ("CUSTOMER".equalsIgnoreCase(user.getRole().name()) || 
                         "ROLE_CUSTOMER".equalsIgnoreCase(user.getRole().name())))
                .map(this::toUserDto)
                .collect(Collectors.toList());

        return ResponseEntity.ok(customers);
    }

    @PutMapping("/work-orders/{id}/assign")
    @AuditLog(action = "ASSIGN_DELIVERY", module = "DISPATCH", description = "Assigned a work order", entityType = "WORK_ORDER")
    public ResponseEntity<?> assignWorkOrder(@PathVariable Long id, @RequestBody AssignRequest request) {
        return workOrderRepository.findById(id).map(workOrder -> {
            workOrder.setAssignedToEmail(request.technicianEmail());
            if ("OPEN".equalsIgnoreCase(workOrder.getStatus()) || "PENDING".equalsIgnoreCase(workOrder.getStatus())) {
                workOrder.setStatus("ASSIGNED");
            }
            WorkOrderEntity updatedOrder = workOrderRepository.save(workOrder);
            return ResponseEntity.ok(toWorkOrderDto(updatedOrder));
        }).orElse(ResponseEntity.notFound().build());
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

    private UserDto toUserDto(UserEntity user) {
        return new UserDto(
                user.getFullName(),
                user.getCompanyName(),
                user.getEmail(),
                user.getPhone(),
                user.getRole() != null ? user.getRole().name().toLowerCase() : "customer",
                user.isEnabled(),
                user.getCreatedAt() != null ? user.getCreatedAt().toString() : null
        );
    }

    public record AssignRequest(String technicianEmail) {}

    public record WorkOrderDto(
            Long id, String title, String description, String siteName,
            String customerEmail, String assignedToEmail, String priority,
            String status, String dueDate, String createdAt
    ) {}

    public record UserDto(
            String fullName, String companyName, String email,
            String phone, String role, boolean enabled, String createdAt
    ) {}
}