package com.pantrypal.backend.product.dto;

import java.time.Instant;
import java.util.UUID;

public record ProductResponse(UUID id, String name, String description, UUID categoryId, String categoryName,
                              String sellingPrice, boolean active, boolean hasRecipe, Instant createdAt, Instant updatedAt) {}
