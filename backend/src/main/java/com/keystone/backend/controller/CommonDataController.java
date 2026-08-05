package com.keystone.backend.controller;

import com.keystone.backend.entity.NotificationEntity;
import com.keystone.backend.entity.PartEntity;
import com.keystone.backend.entity.SiteEntity;
import com.keystone.backend.entity.UserEntity;
import com.keystone.backend.entity.WorkOrderEntity;
import com.keystone.backend.repository.NotificationRepository;
import com.keystone.backend.repository.PartRepository;
import com.keystone.backend.repository.SiteRepository;
import com.keystone.backend.repository.UserRepository;
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
@RequestMapping("/api/data")
@CrossOrigin(origins = "*")
public class CommonDataController {

    private final UserRepository userRepository;
    private final NotificationRepository notificationRepository;
    private final PartRepository partRepository;
    private final SiteRepository siteRepository;
    private final WorkOrderRepository workOrderRepository;

    public CommonDataController(
            UserRepository userRepository,
            NotificationRepository notificationRepository,
            PartRepository partRepository,
            SiteRepository siteRepository,
            WorkOrderRepository workOrderRepository
    ) {
        this.userRepository = userRepository;
        this.notificationRepository = notificationRepository;
        this.partRepository = partRepository;
        this.siteRepository = siteRepository;
        this.workOrderRepository = workOrderRepository;
    }

    private String getCurrentEmail() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getName() == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthorized.");
        }
        return auth.getName();
    }

    @GetMapping("/me")
    public ResponseEntity<UserDto> getCurrentUser() {
        UserEntity user = userRepository.findByEmail(getCurrentEmail())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found."));
        return ResponseEntity.ok(toUserDto(user));
    }

    @GetMapping("/sites/all")
    public ResponseEntity<List<SiteDto>> getAllSites() {
        return ResponseEntity.ok(siteRepository.findAll().stream().map(this::toSiteDto).collect(Collectors.toList()));
    }

    @GetMapping("/notifications")
    public ResponseEntity<List<NotificationDto>> getMyNotifications() {
        return ResponseEntity.ok(
            notificationRepository.findByUserEmail(getCurrentEmail())
                .stream()
                .map(this::toNotificationDto)
                .collect(Collectors.toList())
        );
    }

    @GetMapping("/parts")
    public ResponseEntity<List<PartDto>> getPartInventory() {
        return ResponseEntity.ok(partRepository.findAll().stream().map(this::toPartDto).collect(Collectors.toList()));
    }

    @GetMapping("/work-orders")
    public ResponseEntity<List<WorkOrderDto>> getWorkOrders() {
        return ResponseEntity.ok(
            workOrderRepository.findAll().stream()
                .map(this::toWorkOrderDto)
                .collect(Collectors.toList())
        );
    }

    private UserDto toUserDto(UserEntity user) {
        return new UserDto(
            user.getFullName(),
            user.getCompanyName(),
            user.getEmail(),
            user.getPhone(),
            user.getRole() != null ? user.getRole().name().toLowerCase() : "",
            user.isEnabled(),
            user.getManagerEmail(),
            user.getCreatedAt() == null ? "" : user.getCreatedAt().toString()
        );
    }

    private SiteDto toSiteDto(SiteEntity site) {
        return new SiteDto(
            site.getId(),
            site.getName(),
            site.getAddress(),
            site.getContactName(),
            site.getContactPhone(),
            site.getStatus(),
            site.getCustomerEmail()
        );
    }

    private NotificationDto toNotificationDto(NotificationEntity notification) {
        return new NotificationDto(
            notification.getId(),
            notification.getWorkOrderId(),
            notification.getSenderEmail(),
            notification.getSenderRole() != null ? notification.getSenderRole().toString() : null,
            notification.getRecipientEmail(),
            notification.getRecipientRole() != null ? notification.getRecipientRole().toString() : null,
            notification.getTitle(),
            notification.getMessage(),
            notification.isRead(),
            notification.getCreatedAt() != null ? notification.getCreatedAt().toString() : ""
        );
    }

    private PartDto toPartDto(PartEntity part) {
        return new PartDto(part.getName(), part.getSku(), part.getCategory(), part.getStock(), part.getUnitPrice());
    }

    private WorkOrderDto toWorkOrderDto(WorkOrderEntity wo) {
        String formattedNumber = wo.getId() != null ? "WO-10" + (22 + wo.getId()) : "WO-1023";

        return new WorkOrderDto(
            wo.getId(),
            formattedNumber,
            wo.getTitle() != null ? wo.getTitle() : wo.getDescription(),
            wo.getStatus(),
            wo.getPriority(),
            wo.getSiteName(),
            wo.getCustomerEmail(),
            wo.getAssignedToEmail(),
            wo.getDueDate() != null ? wo.getDueDate().toString() : ""
        );
    }

    public record UserDto(String fullName, String companyName, String email, String phone, String role, boolean enabled, String managerEmail, String createdAt) {}
    public record SiteDto(Long id, String name, String address, String contactName, String contactPhone, String status, String customerEmail) {}
    public record NotificationDto(Long id, Long workOrderId, String senderEmail, String senderRole, String recipientEmail, String recipientRole, String title, String message, Boolean isRead, String createdAt) {}
    public record PartDto(String name, String sku, String category, Integer stock, Double unitPrice) {}
    public record WorkOrderDto(
        Long id,
        String workOrderNumber,
        String title,
        String status,
        String priority,
        String siteName,
        String customerEmail,
        String assignedToEmail,
        String dueDate
    ) {}
}