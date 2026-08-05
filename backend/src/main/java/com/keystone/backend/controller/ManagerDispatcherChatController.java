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
@RequestMapping("/api/chat/manager-dispatcher")
@CrossOrigin(origins = "*")
public class ManagerDispatcherChatController {

    private final UserRepository userRepository;
    private final WorkOrderRepository workOrderRepository;
    private final NotificationRepository notificationRepository;

    public ManagerDispatcherChatController(
            UserRepository userRepository,
            WorkOrderRepository workOrderRepository,
            NotificationRepository notificationRepository) {
        this.userRepository = userRepository;
        this.workOrderRepository = workOrderRepository;
        this.notificationRepository = notificationRepository;
    }

    // 1. GET MESSAGES BETWEEN MANAGER & DISPATCHER ONLY
    @GetMapping("/{workOrderId}")
    public ResponseEntity<List<NotificationEntity>> getMessages(@PathVariable Long workOrderId) {
        List<NotificationEntity> all = notificationRepository.findByWorkOrderIdOrderByCreatedAtAsc(workOrderId);
        
        List<NotificationEntity> managerDispatcherMessages = all.stream()
                .filter(msg -> {
                    String s = msg.getSenderRole() != null ? msg.getSenderRole().toUpperCase() : "";
                    String r = msg.getRecipientRole() != null ? msg.getRecipientRole().toUpperCase() : "";
                    return (s.equals("MANAGER") || s.equals("DISPATCHER")) &&
                           (r.equals("MANAGER") || r.equals("DISPATCHER") || r.isEmpty());
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(managerDispatcherMessages);
    }

    // 2. SEND MESSAGE (BLOCK SUPER_ADMIN FROM POSTING HERE)
    @PostMapping("/{workOrderId}")
    public ResponseEntity<NotificationEntity> sendMessage(
            @PathVariable Long workOrderId,
            @RequestBody ChatPayload payload,
            Authentication auth) {

        UserEntity sender = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));

        String senderRole = sender.getRole() != null ? sender.getRole().name().toUpperCase() : "";

        // Strictly block SUPER_ADMIN or other unauthorized roles from using Manager-Dispatcher chat
        if (!senderRole.equals("MANAGER") && !senderRole.equals("DISPATCHER")) {
            throw new ResponseStatusException(
                HttpStatus.FORBIDDEN, 
                "Super Admins cannot send messages in the Manager-Dispatcher chat. Please log in with a Manager or Dispatcher account."
            );
        }

        WorkOrderEntity workOrder = workOrderRepository.findById(workOrderId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Work Order not found"));

        String recipientEmail = payload.recipientEmail();
        if (recipientEmail == null || recipientEmail.isBlank()) {
            recipientEmail = workOrder.getAssignedToEmail();
        }

        String recipientRole = "";
        if (recipientEmail != null && !recipientEmail.isBlank()) {
            Optional<UserEntity> recipientOpt = userRepository.findByEmail(recipientEmail);
            if (recipientOpt.isPresent() && recipientOpt.get().getRole() != null) {
                recipientRole = recipientOpt.get().getRole().name();
            }
        }

        NotificationEntity notification = new NotificationEntity();
        notification.setWorkOrderId(workOrderId);
        notification.setSenderEmail(sender.getEmail());
        notification.setSenderRole(senderRole);
        notification.setRecipientEmail(recipientEmail);
        notification.setRecipientRole(recipientRole);
        notification.setMessage(payload.message());
        notification.setTitle("Manager-Dispatcher Query on Work Order #" + workOrderId);
        notification.setRead(false);
        notification.setCreatedAt(Instant.now());

        return ResponseEntity.ok(notificationRepository.save(notification));
    }

    public record ChatPayload(String message, String recipientEmail) {}
}