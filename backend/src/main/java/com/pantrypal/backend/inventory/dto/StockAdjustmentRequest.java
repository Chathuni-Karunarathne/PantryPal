package com.pantrypal.backend.inventory.dto;

import com.pantrypal.backend.inventory.entity.MeasurementUnit;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;

/** Signed delta, never a replacement total; negative values remove stock. */
public record StockAdjustmentRequest(
        @NotNull @Digits(integer = 13, fraction = 6) BigDecimal quantityDelta,
        @NotNull MeasurementUnit unit,
        @NotBlank @Size(max = 500) String reason) {}
