package com.pantrypal.backend.inventory.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "ingredients")
public class Ingredient {
    @Id private UUID id;
    @Column(nullable = false, length = 120) private String name;
    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 32) private IngredientCategory category;
    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 16) private MeasurementUnit unit;
    @Enumerated(EnumType.STRING) @Column(name = "storage_location", nullable = false, length = 16) private StorageLocation storageLocation;
    @Column(nullable = false, precision = 19, scale = 6) private BigDecimal quantity = BigDecimal.ZERO;
    @Column(name = "minimum_stock", nullable = false, precision = 19, scale = 6) private BigDecimal minimumStock;
    @Column(nullable = false) private boolean archived;
    @Version private long version;
    @Column(name = "created_at", nullable = false, updatable = false) private Instant createdAt;
    @Column(name = "updated_at", nullable = false) private Instant updatedAt;

    protected Ingredient() {}
    public Ingredient(String name, IngredientCategory category, MeasurementUnit unit,
                      StorageLocation storageLocation, BigDecimal minimumStock) {
        id = UUID.randomUUID();
        this.unit = unit;
        update(name, category, storageLocation, minimumStock);
    }
    public void update(String name, IngredientCategory category, StorageLocation location, BigDecimal minimum) {
        this.name = name.strip(); this.category = category; storageLocation = location; minimumStock = minimum;
    }
    public void setQuantity(BigDecimal quantity) { this.quantity = quantity; }
    public void archive() { archived = true; }
    @PrePersist void create() { createdAt = Instant.now(); updatedAt = createdAt; }
    @PreUpdate void updateTimestamp() { updatedAt = Instant.now(); }
    public UUID getId() { return id; }
    public String getName() { return name; }
    public IngredientCategory getCategory() { return category; }
    public MeasurementUnit getUnit() { return unit; }
    public StorageLocation getStorageLocation() { return storageLocation; }
    public BigDecimal getQuantity() { return quantity; }
    public BigDecimal getMinimumStock() { return minimumStock; }
    public boolean isArchived() { return archived; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
}
