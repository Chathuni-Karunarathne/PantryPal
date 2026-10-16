package com.pantrypal.backend.product.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "products")
public class Product {
    @Id private UUID id;
    @Column(nullable = false, length = 120) private String name;
    @Column(nullable = false, length = 2000) private String description;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "category_id", nullable = false) private ProductCategory category;
    @Column(name = "selling_price", nullable = false, precision = 12, scale = 2) private BigDecimal sellingPrice;
    @Column(nullable = false) private boolean active;
    @OneToOne(mappedBy = "product", fetch = FetchType.LAZY) private Recipe recipe;
    @Column(name = "created_at", nullable = false, updatable = false) private Instant createdAt;
    @Column(name = "updated_at", nullable = false) private Instant updatedAt;

    protected Product() {}
    public Product(String name, String description, ProductCategory category, BigDecimal price, boolean active) {
        id = UUID.randomUUID(); update(name, description, category, price, active);
    }
    public void update(String name, String description, ProductCategory category, BigDecimal price, boolean active) {
        this.name = name.strip(); this.description = description == null ? "" : description.strip();
        this.category = category; sellingPrice = price; this.active = active;
    }
    public void setActive(boolean active) { this.active = active; }
    public void setRecipe(Recipe recipe) { this.recipe = recipe; }
    @PrePersist void create() { createdAt = Instant.now(); updatedAt = createdAt; }
    @PreUpdate void updateTimestamp() { updatedAt = Instant.now(); }
    public UUID getId() { return id; }
    public String getName() { return name; }
    public String getDescription() { return description; }
    public ProductCategory getCategory() { return category; }
    public BigDecimal getSellingPrice() { return sellingPrice; }
    public boolean isActive() { return active; }
    public Recipe getRecipe() { return recipe; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
}
