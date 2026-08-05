package com.keystone.backend.repository;

import com.keystone.backend.entity.PartEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PartRepository extends JpaRepository<PartEntity, Long> {
    
    boolean existsBySku(String sku);
    
    Optional<PartEntity> findBySku(String sku);

    // Enables search filtering by Name, SKU, or Category for the inventory UI
    Page<PartEntity> findByNameContainingIgnoreCaseOrSkuContainingIgnoreCaseOrCategoryContainingIgnoreCase(
            String name, String sku, String category, Pageable pageable);
}