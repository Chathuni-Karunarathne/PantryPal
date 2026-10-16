package com.pantrypal.backend.product.entity;

import com.pantrypal.backend.inventory.entity.Ingredient;
import com.pantrypal.backend.inventory.entity.MeasurementUnit;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.*;

@Entity
@Table(name = "recipes")
public class Recipe {
    @Id private UUID id;
    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_id", nullable = false, unique = true) private Product product;
    @Column(name = "yield_quantity", nullable = false, precision = 19, scale = 6) private BigDecimal yieldQuantity;
    @Column(name = "yield_description", nullable = false, length = 120) private String yieldDescription;
    @OneToMany(mappedBy = "recipe", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<RecipeIngredient> ingredients = new ArrayList<>();
    @Column(name = "created_at", nullable = false, updatable = false) private Instant createdAt;
    @Column(name = "updated_at", nullable = false) private Instant updatedAt;

    protected Recipe() {}
    public Recipe(Product product) { id = UUID.randomUUID(); this.product = product; }
    public void updateYield(BigDecimal quantity, String description) {
        yieldQuantity = quantity; yieldDescription = description.strip(); updatedAt = Instant.now();
    }
    public void retainIngredients(Set<UUID> ids) { ingredients.removeIf(line -> !ids.contains(line.getIngredient().getId())); }
    public void putIngredient(Ingredient ingredient, BigDecimal quantity, MeasurementUnit unit) {
        var existing = ingredients.stream().filter(line -> line.getIngredient().getId().equals(ingredient.getId())).findFirst();
        if (existing.isPresent()) existing.get().update(quantity, unit);
        else ingredients.add(new RecipeIngredient(this, ingredient, quantity, unit));
    }
    @PrePersist void create() { createdAt = Instant.now(); updatedAt = createdAt; }
    public UUID getId() { return id; }
    public UUID getProductId() { return product.getId(); }
    public BigDecimal getYieldQuantity() { return yieldQuantity; }
    public String getYieldDescription() { return yieldDescription; }
    public List<RecipeIngredient> getIngredients() { return Collections.unmodifiableList(ingredients); }
    public Instant getUpdatedAt() { return updatedAt; }
}
