package com.pantrypal.backend.inventory.dto;

import com.pantrypal.backend.inventory.entity.*;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

/** Decimal strings avoid losing stock precision in browser JSON parsing. */
public record IngredientResponse(UUID id, String name, IngredientCategory category, MeasurementUnit unit,
        StorageLocation storageLocation, String quantity, String minimumStock, boolean lowStock,
        LocalDate nextExpiryDate, boolean expiredStock, Instant createdAt, Instant updatedAt) {}
