package com.keystone.backend.service;

import com.keystone.backend.dto.PartRequest;
import com.keystone.backend.dto.PartResponse;
import com.keystone.backend.entity.PartEntity;
import com.keystone.backend.repository.PartRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PartService {

    private final PartRepository partRepository;

    public PartService(PartRepository partRepository) {
        this.partRepository = partRepository;
    }

    @Transactional(readOnly = true)
    public Page<PartResponse> getAllParts(String search, Pageable pageable) {
        Page<PartEntity> parts;
        if (search != null && !search.isBlank()) {
            parts = partRepository.findByNameContainingIgnoreCaseOrSkuContainingIgnoreCaseOrCategoryContainingIgnoreCase(
                    search, search, search, pageable);
        } else {
            parts = partRepository.findAll(pageable);
        }
        return parts.map(this::mapToResponse);
    }

    @Transactional(readOnly = true)
    public PartResponse getPartById(Long id) {
        PartEntity entity = partRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Part not found with ID: " + id));
        return mapToResponse(entity);
    }

    @Transactional
    public PartResponse createPart(PartRequest request) {
        if (partRepository.existsBySku(request.sku())) {
            throw new IllegalArgumentException("A part with SKU '" + request.sku() + "' already exists.");
        }

        PartEntity entity = new PartEntity();
        entity.setName(request.name());
        entity.setSku(request.sku());
        entity.setCategory(request.category());
        entity.setStock(request.stock());
        entity.setUnitPrice(request.unitPrice());

        PartEntity saved = partRepository.save(entity);
        return mapToResponse(saved);
    }

    @Transactional
    public PartResponse updatePart(Long id, PartRequest request) {
        PartEntity entity = partRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Part not found with ID: " + id));

        // Prevent SKU collision if changing SKU
        if (!entity.getSku().equalsIgnoreCase(request.sku()) && partRepository.existsBySku(request.sku())) {
            throw new IllegalArgumentException("A part with SKU '" + request.sku() + "' already exists.");
        }

        entity.setName(request.name());
        entity.setSku(request.sku());
        entity.setCategory(request.category());
        entity.setStock(request.stock());
        entity.setUnitPrice(request.unitPrice());

        return mapToResponse(partRepository.save(entity));
    }

    @Transactional
    public void deletePart(Long id) {
        if (!partRepository.existsById(id)) {
            throw new IllegalArgumentException("Cannot delete. Part not found with ID: " + id);
        }
        partRepository.deleteById(id);
    }

    // Atomic transaction for decrementing stock when work orders consume parts
    @Transactional
    public void deductStock(Long partId, Integer quantityToDeduct) {
        PartEntity part = partRepository.findById(partId)
                .orElseThrow(() -> new IllegalArgumentException("Part not found with ID: " + partId));

        if (part.getStock() < quantityToDeduct) {
            throw new IllegalStateException("Insufficient stock for part: " + part.getName() + 
                    ". Available: " + part.getStock() + ", Requested: " + quantityToDeduct);
        }

        part.setStock(part.getStock() - quantityToDeduct);
        partRepository.save(part);
    }

    private PartResponse mapToResponse(PartEntity entity) {
        return new PartResponse(
            entity.getId(),
            entity.getName(),
            entity.getSku(),
            entity.getCategory(),
            entity.getStock(),
            entity.getUnitPrice(),
            entity.getCreatedAt()
        );
    }
}