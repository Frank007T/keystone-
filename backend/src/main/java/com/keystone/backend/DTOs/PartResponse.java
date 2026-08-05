package com.keystone.backend.dto;

import java.time.Instant;

public record PartResponse(
    Long id,
    String name,
    String sku,
    String category,
    Integer stock,
    Double unitPrice,
    Instant createdAt
) {}