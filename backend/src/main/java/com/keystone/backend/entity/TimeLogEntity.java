package com.keystone.backend.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "time_logs")
public class TimeLogEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long workOrderId;

    @Column(nullable = false)
    private String technicianEmail;

    @Column(nullable = false)
    private Instant startTime;

    private Instant endTime;

    @Column(nullable = false, length = 1000)
    private String notes;

    @Column(nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getWorkOrderId() {
        return workOrderId;
    }

    public void setWorkOrderId(Long workOrderId) {
        this.workOrderId = workOrderId;
    }

    public String getTechnicianEmail() {
        return technicianEmail;
    }

    public void setTechnicianEmail(String technicianEmail) {
        this.technicianEmail = technicianEmail;
    }

    public Instant getStartTime() {
        return startTime;
    }

    public void setStartTime(Instant startTime) {
        this.startTime = startTime;
    }

    public Instant getEndTime() {
        return endTime;
    }

    public void setEndTime(Instant endTime) {
        this.endTime = endTime;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
