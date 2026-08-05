package com.keystone.backend.repository;

import com.keystone.backend.entity.NotificationEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<NotificationEntity, Long> {

    // 1. Fixes the exact line 60 in CommonDataController
    @Query("SELECT n FROM NotificationEntity n WHERE n.recipientEmail = :email OR n.senderEmail = :email ORDER BY n.createdAt DESC")
    List<NotificationEntity> findByUserEmail(@Param("email") String email);

    // 2. Fetch by recipient email specifically
    List<NotificationEntity> findByRecipientEmail(String recipientEmail);

    // 3. Fetch thread history by Work Order ID (All roles)
    List<NotificationEntity> findByWorkOrderIdOrderByCreatedAtAsc(Long workOrderId);

    // 4. Fetch all messages (For Super Admin)
    List<NotificationEntity> findAllByOrderByCreatedAtDesc();

    // 5. Fetch thread history ONLY between Dispatcher and Technician
    @Query("SELECT n FROM NotificationEntity n " +
           "WHERE n.workOrderId = :workOrderId " +
           "AND n.senderRole IN ('DISPATCHER', 'TECHNICIAN') " +
           "AND n.recipientRole IN ('DISPATCHER', 'TECHNICIAN') " +
           "ORDER BY n.createdAt ASC")
    List<NotificationEntity> findDispatcherTechnicianMessages(@Param("workOrderId") Long workOrderId);
}