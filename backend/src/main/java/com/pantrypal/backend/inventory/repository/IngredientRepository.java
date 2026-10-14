package com.pantrypal.backend.inventory.repository;

import com.pantrypal.backend.inventory.entity.Ingredient;
import jakarta.persistence.LockModeType;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

public interface IngredientRepository extends JpaRepository<Ingredient, UUID>, JpaSpecificationExecutor<Ingredient> {
    Optional<Ingredient> findByIdAndArchivedFalse(UUID id);
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select i from Ingredient i where i.id = :id and i.archived = false")
    Optional<Ingredient> lockActive(@Param("id") UUID id);
}
