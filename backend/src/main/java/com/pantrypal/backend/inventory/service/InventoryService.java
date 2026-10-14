package com.pantrypal.backend.inventory.service;

import com.pantrypal.backend.inventory.dto.*;
import com.pantrypal.backend.inventory.entity.*;
import com.pantrypal.backend.inventory.repository.*;
import jakarta.persistence.criteria.Predicate;
import java.math.BigDecimal;
import java.time.Clock;
import java.time.LocalDate;
import java.util.*;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class InventoryService {
    private static final BigDecimal MAX_QUANTITY = new BigDecimal("9999999999999.999999");
    private final IngredientRepository ingredients;
    private final StockBatchRepository batches;
    private final InventoryMovementRepository movements;
    private final Clock clock;

    public InventoryService(IngredientRepository ingredients, StockBatchRepository batches,
                            InventoryMovementRepository movements, Clock clock) {
        this.ingredients = ingredients; this.batches = batches; this.movements = movements; this.clock = clock;
    }

    public record IngredientPage(List<IngredientResponse> items, int page, int size, long totalElements, int totalPages) {}
    public record Overview(long totalIngredients, long lowStock, long outOfStock, long pantry, long refrigerator, long freezer) {}

    public IngredientPage list(String search, IngredientCategory category, StorageLocation storage,
                               boolean lowStock, int page, int size) {
        if (page < 0 || size < 1 || size > 100 || (search != null && search.length() > 120)) {
            throw new InventoryException(400, "INVALID_FILTER", "Use a valid search, page, and page size (1–100).");
        }
        var result = ingredients.findAll(filter(search, category, storage, lowStock),
                PageRequest.of(page, size, Sort.by("name", "id")));
        var expiry = expiryDates(result.getContent().stream().map(Ingredient::getId).toList());
        return new IngredientPage(result.getContent().stream().map(i -> response(i, expiry.get(i.getId()))).toList(),
                page, size, result.getTotalElements(), result.getTotalPages());
    }

    public Overview overview() {
        var active = filter(null, null, null, false);
        return new Overview(ingredients.count(active), ingredients.count(filter(null, null, null, true)),
                ingredients.count(active.and((r, q, cb) -> cb.equal(r.get("quantity"), BigDecimal.ZERO))),
                ingredients.count(filter(null, null, StorageLocation.PANTRY, false)),
                ingredients.count(filter(null, null, StorageLocation.REFRIGERATOR, false)),
                ingredients.count(filter(null, null, StorageLocation.FREEZER, false)));
    }

    public IngredientResponse get(UUID id) { return response(find(id), expiryDates(List.of(id)).get(id)); }

    @Transactional
    public IngredientResponse create(CreateIngredientRequest request, UUID actor) {
        var metadata = request.ingredient();
        var ingredient = ingredients.saveAndFlush(new Ingredient(metadata.name(), metadata.category(), metadata.unit(),
                metadata.storageLocation(), metadata.minimumStock()));
        if (request.initialQuantity().signum() > 0) {
            changeStock(ingredient, request.initialQuantity(), request.expiryDate(), "Opening stock", InventoryMovement.Type.INITIAL_STOCK, actor);
        } else if (request.expiryDate() != null) {
            throw new InventoryException(400, "INVALID_EXPIRY", "An expiry date requires an opening stock quantity.");
        }
        ingredients.flush();
        return get(ingredient.getId());
    }

    @Transactional
    public IngredientResponse update(UUID id, IngredientRequest request) {
        var ingredient = lock(id);
        if (request.unit() != ingredient.getUnit()) {
            throw new InventoryException(409, "UNIT_FIXED", "The stock unit cannot be changed after ingredient creation.");
        }
        ingredient.update(request.name(), request.category(), request.storageLocation(), request.minimumStock());
        ingredients.flush();
        return get(id);
    }

    @Transactional
    public void delete(UUID id) {
        var ingredient = lock(id);
        if (ingredient.getQuantity().signum() > 0) {
            throw new InventoryException(409, "STOCK_REMAINING", "Adjust remaining stock to zero before deleting this ingredient.");
        }
        // Retain stock history and future recipe references.
        ingredient.archive();
    }

    @Transactional
    public IngredientResponse intake(UUID id, StockIntakeRequest request, UUID actor) {
        var ingredient = lock(id);
        var delta = request.unit().convert(request.quantity(), ingredient.getUnit());
        changeStock(ingredient, delta, request.expiryDate(), request.reason(), InventoryMovement.Type.INTAKE, actor);
        ingredients.flush();
        return get(id);
    }

    @Transactional
    public IngredientResponse adjust(UUID id, StockAdjustmentRequest request, UUID actor) {
        var ingredient = lock(id);
        var delta = request.unit().convert(request.quantityDelta(), ingredient.getUnit());
        changeStock(ingredient, delta, null, request.reason(), InventoryMovement.Type.ADJUSTMENT, actor);
        ingredients.flush();
        return get(id);
    }

    private void changeStock(Ingredient ingredient, BigDecimal delta, LocalDate expiry, String reason,
                             InventoryMovement.Type type, UUID actor) {
        if (delta.signum() == 0) throw new InventoryException(400, "ZERO_ADJUSTMENT", "Enter a non-zero stock quantity.");
        BigDecimal after = ingredient.getQuantity().add(delta);
        if (after.signum() < 0) throw new InventoryException(409, "INSUFFICIENT_STOCK", "This adjustment would make stock negative.");
        if (after.compareTo(MAX_QUANTITY) > 0) throw new InventoryException(400, "QUANTITY_TOO_LARGE", "The resulting stock quantity is too large.");
        if (delta.signum() > 0) {
            batches.save(new StockBatch(ingredient.getId(), delta, expiry));
        } else {
            // All writers first lock the ingredient; batches and aggregate stock stay atomic.
            BigDecimal remaining = delta.negate();
            for (var batch : batches.available(ingredient.getId())) {
                BigDecimal consumed = remaining.min(batch.getRemainingQuantity());
                batch.consume(consumed); remaining = remaining.subtract(consumed);
                if (remaining.signum() == 0) break;
            }
            if (remaining.signum() > 0) throw new IllegalStateException("Stock receipts do not match ingredient balance");
        }
        ingredient.setQuantity(after);
        movements.save(new InventoryMovement(ingredient.getId(), actor, type, delta, after, reason, expiry));
    }

    private Ingredient find(UUID id) { return ingredients.findByIdAndArchivedFalse(id).orElseThrow(InventoryService::notFound); }
    private Ingredient lock(UUID id) { return ingredients.lockActive(id).orElseThrow(InventoryService::notFound); }
    private static InventoryException notFound() { return new InventoryException(404, "INGREDIENT_NOT_FOUND", "This ingredient could not be found."); }

    private Specification<Ingredient> filter(String search, IngredientCategory category, StorageLocation storage, boolean lowStock) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.isFalse(root.get("archived")));
            if (search != null && !search.isBlank()) {
                String escaped = search.strip().toLowerCase(Locale.ROOT).replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_");
                predicates.add(cb.like(cb.lower(root.get("name")), "%" + escaped + "%", '\\'));
            }
            if (category != null) predicates.add(cb.equal(root.get("category"), category));
            if (storage != null) predicates.add(cb.equal(root.get("storageLocation"), storage));
            if (lowStock) predicates.add(cb.lessThan(root.get("quantity"), root.get("minimumStock")));
            return cb.and(predicates.toArray(Predicate[]::new));
        };
    }

    private Map<UUID, LocalDate> expiryDates(List<UUID> ids) {
        Map<UUID, LocalDate> result = new HashMap<>();
        if (!ids.isEmpty()) {
            for (var batch : batches.findByIngredientIdInAndRemainingQuantityGreaterThan(ids, BigDecimal.ZERO)) {
                if (batch.getExpiryDate() != null) result.merge(batch.getIngredientId(), batch.getExpiryDate(),
                        (a, b) -> a.isBefore(b) ? a : b);
            }
        }
        return result;
    }

    private IngredientResponse response(Ingredient i, LocalDate expiry) {
        return new IngredientResponse(i.getId(), i.getName(), i.getCategory(), i.getUnit(), i.getStorageLocation(),
                i.getQuantity().setScale(6).toPlainString(), i.getMinimumStock().setScale(6).toPlainString(), i.getQuantity().compareTo(i.getMinimumStock()) < 0,
                expiry, expiry != null && expiry.isBefore(LocalDate.now(clock)), i.getCreatedAt(), i.getUpdatedAt());
    }
}
