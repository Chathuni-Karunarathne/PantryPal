package com.pantrypal.backend.inventory.repository;

import com.pantrypal.backend.inventory.entity.InventoryMovement;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InventoryMovementRepository extends JpaRepository<InventoryMovement, UUID> {}
