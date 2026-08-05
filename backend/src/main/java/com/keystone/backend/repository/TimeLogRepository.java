package com.keystone.backend.repository;

import com.keystone.backend.entity.TimeLogEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TimeLogRepository extends JpaRepository<TimeLogEntity, Long> {
    List<TimeLogEntity> findByTechnicianEmail(String technicianEmail);
}
