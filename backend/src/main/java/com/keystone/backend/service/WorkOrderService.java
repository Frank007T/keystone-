package com.keystone.backend.service;

// 1. REMOVE: import com.keystone.backend.model.WorkOrder;
// 2. ADD: Import the entity from backend.entity
import com.keystone.backend.entity.WorkOrderEntity;
import com.keystone.backend.repository.WorkOrderRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class WorkOrderService {

    private final WorkOrderRepository workOrderRepository;

    public WorkOrderService(WorkOrderRepository workOrderRepository) {
        this.workOrderRepository = workOrderRepository;
    }

    public List<WorkOrderEntity> getAllWorkOrders() {
        return workOrderRepository.findAll();
    }

    public Optional<WorkOrderEntity> getWorkOrderById(Long id) {
        return workOrderRepository.findById(id);
    }

    public WorkOrderEntity saveWorkOrder(WorkOrderEntity workOrder) {
        return workOrderRepository.save(workOrder);
    }

    public void deleteWorkOrder(Long id) {
        workOrderRepository.deleteById(id);
    }
}