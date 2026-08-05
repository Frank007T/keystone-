package com.keystone.backend.repository;

import com.keystone.backend.entity.SiteEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SiteRepository extends JpaRepository<SiteEntity, Long> {
    List<SiteEntity> findByCustomerEmail(String customerEmail);
}
