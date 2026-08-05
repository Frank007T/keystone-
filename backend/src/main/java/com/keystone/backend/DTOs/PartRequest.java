package com.keystone.backend.dto;

import jakarta.validation.constraints.*;

public record PartRequest(
    @NotBlank(message = "Part name is required")
    String name,

    @NotBlank(message = "SKU is required")
    String sku,

    @NotBlank(message = "Category is required")
    String category,

    @NotNull(message = "Stock quantity is required")
    @Min(value = 0, message = "Stock cannot be negative")
    Integer stock,

    @NotNull(message = "Unit price is required")
    @PositiveOrZero(message = "Unit price must be positive or zero")
    Double unitPrice
) {}