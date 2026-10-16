package com.pantrypal.backend.product.dto;

import com.pantrypal.backend.inventory.entity.MeasurementUnit;
import java.time.Instant;
import java.util.*;

public record RecipeResponse(UUID id, UUID productId, String yieldQuantity, String yieldDescription,
                             List<Line> ingredients, Instant updatedAt) {
    public record Line(UUID ingredientId, String ingredientName, String quantity, MeasurementUnit unit,
                       String stockQuantity, MeasurementUnit stockUnit, boolean archived) {}
}
