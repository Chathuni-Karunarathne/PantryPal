package com.pantrypal.backend.inventory.dto;

import com.pantrypal.backend.inventory.entity.*;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;

/** Metadata only: changing this request never overwrites stock. Unit is fixed after creation. */
public record IngredientRequest(
        @NotBlank @Size(max = 120) String name,
        @NotNull IngredientCategory category,
        @NotNull MeasurementUnit unit,
        @NotNull StorageLocation storageLocation,
        @NotNull @DecimalMin("0") @Digits(integer = 13, fraction = 6) BigDecimal minimumStock) {}
