package com.pantrypal.backend.inventory.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "stock_batches")
public class StockBatch {
    @Id private UUID id;
    @Column(name = "ingredient_id", nullable = false) private UUID ingredientId;
    @Column(name = "remaining_quantity", nullable = false, precision = 19, scale = 6) private BigDecimal remainingQuantity;
    @Column(name = "expiry_date") private LocalDate expiryDate;
    @Column(name = "received_at", nullable = false) private Instant receivedAt;
    protected StockBatch() {}
    public StockBatch(UUID ingredientId, BigDecimal quantity, LocalDate expiryDate) {
        id = UUID.randomUUID(); this.ingredientId = ingredientId; remainingQuantity = quantity;
        this.expiryDate = expiryDate; receivedAt = Instant.now();
    }
    public UUID getIngredientId() { return ingredientId; }
    public BigDecimal getRemainingQuantity() { return remainingQuantity; }
    public LocalDate getExpiryDate() { return expiryDate; }
    public void consume(BigDecimal quantity) { remainingQuantity = remainingQuantity.subtract(quantity); }
}
