package com.pantrypal.backend.product.entity;

import com.pantrypal.backend.inventory.entity.*;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "recipe_ingredients", uniqueConstraints = @UniqueConstraint(columnNames = {"recipe_id", "ingredient_id"}))
public class RecipeIngredient {
    @Id private UUID id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "recipe_id", nullable = false) private Recipe recipe;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "ingredient_id", nullable = false) private Ingredient ingredient;
    @Column(nullable = false, precision = 19, scale = 6) private BigDecimal quantity;
    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 16) private MeasurementUnit unit;

    protected RecipeIngredient() {}
    public RecipeIngredient(Recipe recipe, Ingredient ingredient, BigDecimal quantity, MeasurementUnit unit) {
        id = UUID.randomUUID(); this.recipe = recipe; this.ingredient = ingredient; update(quantity, unit);
    }
    public void update(BigDecimal quantity, MeasurementUnit unit) { this.quantity = quantity; this.unit = unit; }
    public Ingredient getIngredient() { return ingredient; }
    public BigDecimal getQuantity() { return quantity; }
    public MeasurementUnit getUnit() { return unit; }
}
