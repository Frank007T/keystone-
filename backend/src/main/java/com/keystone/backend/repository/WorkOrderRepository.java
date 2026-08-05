package com.keystone.backend.repository;

import com.keystone.backend.entity.WorkOrderEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WorkOrderRepository extends JpaRepository<WorkOrderEntity, Long> {

    List<WorkOrderEntity> findByCustomerEmail(String customerEmail);

    List<WorkOrderEntity> findByAssignedToEmail(String assignedToEmail);

    // Fetch work orders where the associated site or user belongs to a specific zone
    @Query("SELECT w FROM WorkOrderEntity w WHERE w.zoneId = :zoneId")
    List<WorkOrderEntity> findByZoneId(@Param("zoneId") Long zoneId);
}