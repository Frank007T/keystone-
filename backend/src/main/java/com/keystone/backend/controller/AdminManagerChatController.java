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
@RequestMapping("/api/chat/admin-manager")
@CrossOrigin(origins = "*")
public class AdminManagerChatController {

    private final UserRepository userRepository;
    private final WorkOrderRepository workOrderRepository;
    private final NotificationRepository notificationRepository;

    public AdminManagerChatController(
            UserRepository userRepository,
            WorkOrderRepository workOrderRepository,
            NotificationRepository notificationRepository) {
        this.userRepository = userRepository;
        this.workOrderRepository = workOrderRepository;
        this.notificationRepository = notificationRepository;
    }

    @GetMapping("/{workOrderId}")
    public ResponseEntity<List<NotificationEntity>> getMessages(@PathVariable Long workOrderId) {
        List<NotificationEntity> all = notificationRepository.findByWorkOrderIdOrderByCreatedAtAsc(workOrderId);

        List<NotificationEntity> adminManagerMessages = all.stream()
                .filter(msg -> {
                    String s = msg.getSenderRole() != null ? msg.getSenderRole().toUpperCase() : "";
                    String r = msg.getRecipientRole() != null ? msg.getRecipientRole().toUpperCase() : "";
                    return (s.equals("SUPER_ADMIN") || s.equals("MANAGER")) &&
                           (r.equals("SUPER_ADMIN") || r.equals("MANAGER") || r.isEmpty());
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(adminManagerMessages);
    }

    @PostMapping("/{workOrderId}")
    public ResponseEntity<NotificationEntity> sendMessage(
            @PathVariable Long workOrderId,
            @RequestBody ChatPayload payload,
            Authentication auth) {

        UserEntity sender = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));

        String senderRole = sender.getRole() != null ? sender.getRole().name().toUpperCase() : "";

        if (!senderRole.equals("SUPER_ADMIN") && !senderRole.equals("MANAGER")) {
            throw new ResponseStatusException(
                HttpStatus.FORBIDDEN, 
                "Only Super Admins and Managers can participate in this chat channel."
            );
        }

        WorkOrderEntity workOrder = workOrderRepository.findById(workOrderId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Work Order not found"));

        String recipientEmail = payload.recipientEmail();
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
        notification.setTitle("Admin-Manager Query on Work Order #" + workOrderId);
        notification.setRead(false);
        notification.setCreatedAt(Instant.now());

        return ResponseEntity.ok(notificationRepository.save(notification));
    }

    public record ChatPayload(String message, String recipientEmail) {}
}