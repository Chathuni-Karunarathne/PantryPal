package com.pantrypal.backend.product.entity;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "product_categories")
public class ProductCategory {
    @Id private UUID id;
    @Column(nullable = false, length = 120) private String name;
    @Column(name = "created_at", nullable = false, updatable = false) private Instant createdAt;
    @Column(name = "updated_at", nullable = false) private Instant updatedAt;

    protected ProductCategory() {}
    public ProductCategory(String name) { id = UUID.randomUUID(); rename(name); }
    public void rename(String name) { this.name = name.strip(); }
    @PrePersist void create() { createdAt = Instant.now(); updatedAt = createdAt; }
    @PreUpdate void updateTimestamp() { updatedAt = Instant.now(); }
    public UUID getId() { return id; }
    public String getName() { return name; }
}
