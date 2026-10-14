package com.pantrypal.backend.inventory.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDate;

public record CreateIngredientRequest(
        @NotNull @Valid IngredientRequest ingredient,
        @NotNull @DecimalMin("0") @Digits(integer = 13, fraction = 6) BigDecimal initialQuantity,
        @FutureOrPresent LocalDate expiryDate) {}
