package com.pantrypal.backend.product.dto;

import com.pantrypal.backend.inventory.entity.MeasurementUnit;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.util.*;

public record RecipeRequest(
        @NotNull @DecimalMin(value = "0", inclusive = false) @Digits(integer = 13, fraction = 6) BigDecimal yieldQuantity,
        @NotBlank @Size(max = 120) String yieldDescription,
        @NotEmpty @Size(max = 200) List<@NotNull @Valid Line> ingredients) {
    public record Line(@NotNull UUID ingredientId,
                       @NotNull @DecimalMin(value = "0", inclusive = false) @Digits(integer = 13, fraction = 6) BigDecimal quantity,
                       @NotNull MeasurementUnit unit) {}
}
