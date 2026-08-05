package com.keystone.backend.controller;

import com.keystone.backend.entity.NotificationEntity;
import com.keystone.backend.repository.NotificationRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;

@RestController
@RequestMapping("/api/chat/dispatcher-technician")
@CrossOrigin(origins = "*")
public class DispatcherTechnicianChatController {

    private final NotificationRepository notificationRepository;

    public DispatcherTechnicianChatController(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    @GetMapping("/{workOrderId}")
    public ResponseEntity<List<NotificationEntity>> getMessages(@PathVariable Long workOrderId) {
        // Fetch only messages between Dispatcher and Technician
        List<NotificationEntity> messages = notificationRepository.findDispatcherTechnicianMessages(workOrderId);
        return ResponseEntity.ok(messages);
    }

    @PostMapping("/{workOrderId}")
    public ResponseEntity<NotificationEntity> sendMessage(
            @PathVariable Long workOrderId,
            @RequestBody MessageRequest request,
            Authentication authentication) {

        String senderEmail = (authentication != null && authentication.getName() != null) 
                ? authentication.getName() 
                : "dispatcher@keystone.com";

        NotificationEntity notification = new NotificationEntity();
        notification.setWorkOrderId(workOrderId);
        notification.setSenderEmail(senderEmail);
        notification.setSenderRole("DISPATCHER");
        notification.setRecipientEmail(request.recipientEmail() != null ? request.recipientEmail() : "unassigned");
        notification.setRecipientRole("TECHNICIAN");
        notification.setTitle("Work Order Chat");
        notification.setMessage(request.message());
        notification.setRead(false);
        notification.setCreatedAt(Instant.now());

        NotificationEntity saved = notificationRepository.save(notification);
        return ResponseEntity.ok(saved);
    }

    public record MessageRequest(String message, String recipientEmail) {}
}