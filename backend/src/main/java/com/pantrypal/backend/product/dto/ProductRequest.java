package com.pantrypal.backend.product.dto;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.util.UUID;

public record ProductRequest(
        @NotBlank @Size(max = 120) String name,
        @Size(max = 2000) String description,
        @NotNull UUID categoryId,
        @NotNull @DecimalMin("0") @Digits(integer = 10, fraction = 2) BigDecimal sellingPrice,
        @NotNull Boolean active) {}
