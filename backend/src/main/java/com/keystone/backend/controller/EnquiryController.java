package com.keystone.backend.controller;

import com.keystone.backend.entity.NotificationEntity;
import com.keystone.backend.entity.UserEntity;
import com.keystone.backend.entity.WorkOrderEntity;
import com.keystone.backend.repository.NotificationRepository;
import com.keystone.backend.repository.UserRepository;
import com.keystone.backend.repository.WorkOrderRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/data/requests")
@CrossOrigin(origins = "*")
public class EnquiryController {

    private final UserRepository userRepository;
    private final WorkOrderRepository workOrderRepository;
    private final NotificationRepository notificationRepository;

    public EnquiryController(
            UserRepository userRepository,
            WorkOrderRepository workOrderRepository,
            NotificationRepository notificationRepository) {
        this.userRepository = userRepository;
        this.workOrderRepository = workOrderRepository;
        this.notificationRepository = notificationRepository;
    }

    // =========================================================================
    // 1. SUPER ADMIN <-> MANAGER CHAT ENDPOINT
    // =========================================================================
    @GetMapping("/{id}/messages/admin-manager")
    public ResponseEntity<List<NotificationEntity>> getAdminManagerMessages(@PathVariable Long id) {
        List<NotificationEntity> allMessages = notificationRepository.findByWorkOrderIdOrderByCreatedAtAsc(id);
        List<NotificationEntity> filtered = allMessages.stream()
                .filter(msg -> isRoleMatch(msg, "SUPER_ADMIN", "MANAGER"))
                .collect(Collectors.toList());
        return ResponseEntity.ok(filtered);
    }

    // =========================================================================
    // 2. MANAGER <-> DISPATCHER CHAT ENDPOINT
    // =========================================================================
    @GetMapping("/{id}/messages/manager-dispatcher")
    public ResponseEntity<List<NotificationEntity>> getManagerDispatcherMessages(@PathVariable Long id) {
        List<NotificationEntity> allMessages = notificationRepository.findByWorkOrderIdOrderByCreatedAtAsc(id);
        List<NotificationEntity> filtered = allMessages.stream()
                .filter(msg -> isRoleMatch(msg, "MANAGER", "DISPATCHER"))
                .collect(Collectors.toList());
        return ResponseEntity.ok(filtered);
    }

    // =========================================================================
    // 3. DISPATCHER <-> TECHNICIAN CHAT ENDPOINT
    // =========================================================================
    @GetMapping("/{id}/messages/dispatcher-technician")
    public ResponseEntity<List<NotificationEntity>> getDispatcherTechnicianMessages(@PathVariable Long id) {
        List<NotificationEntity> allMessages = notificationRepository.findByWorkOrderIdOrderByCreatedAtAsc(id);
        List<NotificationEntity> filtered = allMessages.stream()
                .filter(msg -> isRoleMatch(msg, "DISPATCHER", "TECHNICIAN"))
                .collect(Collectors.toList());
        return ResponseEntity.ok(filtered);
    }

    // =========================================================================
    // 4. COMMON SEND MESSAGE ENDPOINT
    // =========================================================================
    @PostMapping("/{id}/query")
    public ResponseEntity<NotificationEntity> sendQuery(
            @PathVariable Long id,
            @RequestBody QueryPayload payload,
            Authentication auth) {

        UserEntity sender = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));

        WorkOrderEntity workOrder = workOrderRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Work Order not found"));

        String recipientEmail = payload.recipientEmail();
        if (recipientEmail == null || recipientEmail.isBlank()) {
            recipientEmail = workOrder.getAssignedToEmail() != null 
                    ? workOrder.getAssignedToEmail() 
                    : workOrder.getCustomerEmail();
        }

        String recipientRole = "";
        if (recipientEmail != null && !recipientEmail.isBlank()) {
            Optional<UserEntity> recipientOpt = userRepository.findByEmail(recipientEmail);
            if (recipientOpt.isPresent() && recipientOpt.get().getRole() != null) {
                recipientRole = recipientOpt.get().getRole().name();
            }
        }

        NotificationEntity notification = new NotificationEntity();
        notification.setWorkOrderId(id);
        notification.setSenderEmail(sender.getEmail());
        notification.setSenderRole(sender.getRole() != null ? sender.getRole().name() : "USER");
        notification.setRecipientEmail(recipientEmail);
        notification.setRecipientRole(recipientRole);
        notification.setMessage(payload.message());
        notification.setTitle(payload.title() != null && !payload.title().isBlank() 
                ? payload.title() 
                : "Enquiry on Work Order #" + id);
        notification.setRead(false);
        notification.setCreatedAt(Instant.now());

        return ResponseEntity.ok(notificationRepository.save(notification));
    }

    // =========================================================================
    // MATCHING HELPER LOGIC
    // =========================================================================
    private boolean isRoleMatch(NotificationEntity msg, String roleA, String roleB) {
        String sRole = msg.getSenderRole() != null ? msg.getSenderRole().toUpperCase() : "";
        String rRole = msg.getRecipientRole() != null ? msg.getRecipientRole().toUpperCase() : "";

        // Allow SUPER_ADMIN messages to appear across management channels
        if (sRole.equals("SUPER_ADMIN")) {
            return true;
        }

        // Direct Role Match (e.g., MANAGER <-> DISPATCHER)
        if ((sRole.equals(roleA) && rRole.equals(roleB)) || (sRole.equals(roleB) && rRole.equals(roleA))) {
            return true;
        }

        // Fallback match when recipientRole in DB is blank or null
        if (rRole.isEmpty()) {
            return sRole.equals(roleA) || sRole.equals(roleB);
        }

        return false;
    }

    public record QueryPayload(String message, String recipientEmail, String title) {}
}