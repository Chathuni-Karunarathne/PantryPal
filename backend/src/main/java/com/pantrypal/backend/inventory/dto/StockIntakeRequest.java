package com.pantrypal.backend.inventory.dto;

import com.pantrypal.backend.inventory.entity.MeasurementUnit;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDate;

public record StockIntakeRequest(
        @NotNull @DecimalMin(value = "0", inclusive = false) @Digits(integer = 13, fraction = 6) BigDecimal quantity,
        @NotNull MeasurementUnit unit,
        @FutureOrPresent LocalDate expiryDate,
        @NotBlank @Size(max = 500) String reason) {}
