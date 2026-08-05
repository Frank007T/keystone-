package com.keystone.backend.repository;

import com.keystone.backend.entity.InvoiceEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface InvoiceRepository extends JpaRepository<InvoiceEntity, Long> {
    List<InvoiceEntity> findByCustomerEmail(String customerEmail);
}
