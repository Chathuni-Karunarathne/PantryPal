package com.pantrypal.backend.product.repository;

import com.pantrypal.backend.product.entity.Recipe;
import java.util.*;
import org.springframework.data.jpa.repository.*;

public interface RecipeRepository extends JpaRepository<Recipe, UUID> {
    @EntityGraph(attributePaths = {"ingredients", "ingredients.ingredient"})
    Optional<Recipe> findByProduct_Id(UUID productId);
}
