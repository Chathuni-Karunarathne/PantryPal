package com.pantrypal.backend.product.repository;

import com.pantrypal.backend.product.entity.ProductCategory;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductCategoryRepository extends JpaRepository<ProductCategory, UUID> {
    boolean existsByNameIgnoreCaseAndIdNot(String name, UUID id);
}
