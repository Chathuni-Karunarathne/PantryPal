package com.pantrypal.backend.inventory.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "inventory_movements")
public class InventoryMovement {
    public enum Type { INITIAL_STOCK, INTAKE, ADJUSTMENT }
    @Id private UUID id;
    @Column(name = "ingredient_id", nullable = false) private UUID ingredientId;
    @Column(name = "actor_id", nullable = false) private UUID actorId;
    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 24) private Type type;
    @Column(name = "quantity_delta", nullable = false, precision = 19, scale = 6) private BigDecimal quantityDelta;
    @Column(name = "quantity_after", nullable = false, precision = 19, scale = 6) private BigDecimal quantityAfter;
    @Column(nullable = false, length = 500) private String reason;
    @Column(name = "expiry_date") private LocalDate expiryDate;
    @Column(name = "created_at", nullable = false) private Instant createdAt;
    protected InventoryMovement() {}
    public InventoryMovement(UUID ingredientId, UUID actorId, Type type, BigDecimal delta,
                             BigDecimal after, String reason, LocalDate expiryDate) {
        id = UUID.randomUUID(); this.ingredientId = ingredientId; this.actorId = actorId; this.type = type;
        quantityDelta = delta; quantityAfter = after; this.reason = reason.strip();
        this.expiryDate = expiryDate; createdAt = Instant.now();
    }
}
