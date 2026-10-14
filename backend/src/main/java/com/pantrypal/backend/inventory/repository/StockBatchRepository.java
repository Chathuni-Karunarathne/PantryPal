package com.pantrypal.backend.inventory.repository;

import com.pantrypal.backend.inventory.entity.StockBatch;
import java.util.Collection;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

public interface StockBatchRepository extends JpaRepository<StockBatch, UUID> {
    @Query("select b from StockBatch b where b.ingredientId = :id and b.remainingQuantity > 0 order by b.expiryDate asc nulls last, b.receivedAt asc, b.id asc")
    List<StockBatch> available(@Param("id") UUID id);
    List<StockBatch> findByIngredientIdInAndRemainingQuantityGreaterThan(Collection<UUID> ids, java.math.BigDecimal quantity);
}
