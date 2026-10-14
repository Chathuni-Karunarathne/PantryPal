package com.pantrypal.backend.inventory.controller;

import com.pantrypal.backend.inventory.dto.*;
import com.pantrypal.backend.inventory.entity.*;
import com.pantrypal.backend.inventory.service.InventoryService;
import com.pantrypal.backend.security.AuthenticatedUser;
import jakarta.validation.Valid;
import java.net.URI;
import java.util.Map;
import java.util.UUID;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/inventory")
@PreAuthorize("hasAnyRole('OWNER_ADMIN', 'MANAGER', 'INVENTORY_STAFF')")
public class InventoryController {
    private final InventoryService service;
    public InventoryController(InventoryService service) { this.service = service; }

    @GetMapping("/options")
    public ResponseEntity<?> options() {
        return ok(Map.of("categories", IngredientCategory.values(), "units", MeasurementUnit.values(), "storageLocations", StorageLocation.values()));
    }
    @GetMapping("/overview")
    public ResponseEntity<InventoryService.Overview> overview() { return ok(service.overview()); }
    @GetMapping("/ingredients")
    public ResponseEntity<InventoryService.IngredientPage> list(@RequestParam(required = false) String search,
            @RequestParam(required = false) IngredientCategory category,
            @RequestParam(required = false) StorageLocation storageLocation,
            @RequestParam(defaultValue = "false") boolean lowStock,
            @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "25") int size) {
        return ok(service.list(search, category, storageLocation, lowStock, page, size));
    }
    @GetMapping("/ingredients/{id}")
    public ResponseEntity<IngredientResponse> get(@PathVariable UUID id) { return ok(service.get(id)); }
    @PostMapping("/ingredients")
    public ResponseEntity<IngredientResponse> create(@Valid @RequestBody CreateIngredientRequest request,
            @AuthenticationPrincipal AuthenticatedUser principal) {
        var ingredient = service.create(request, principal.user().id());
        return ResponseEntity.created(URI.create("/api/inventory/ingredients/" + ingredient.id()))
                .cacheControl(CacheControl.noStore()).body(ingredient);
    }
    @PutMapping("/ingredients/{id}")
    public ResponseEntity<IngredientResponse> update(@PathVariable UUID id, @Valid @RequestBody IngredientRequest request) {
        return ok(service.update(id, request));
    }
    @DeleteMapping("/ingredients/{id}")
    @PreAuthorize("hasAnyRole('OWNER_ADMIN', 'MANAGER')")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.delete(id); return ResponseEntity.noContent().cacheControl(CacheControl.noStore()).build();
    }
    @PostMapping("/ingredients/{id}/intake")
    public ResponseEntity<IngredientResponse> intake(@PathVariable UUID id, @Valid @RequestBody StockIntakeRequest request,
            @AuthenticationPrincipal AuthenticatedUser principal) {
        return ok(service.intake(id, request, principal.user().id()));
    }
    @PostMapping("/ingredients/{id}/adjustments")
    public ResponseEntity<IngredientResponse> adjust(@PathVariable UUID id, @Valid @RequestBody StockAdjustmentRequest request,
            @AuthenticationPrincipal AuthenticatedUser principal) {
        return ok(service.adjust(id, request, principal.user().id()));
    }
    private <T> ResponseEntity<T> ok(T body) { return ResponseEntity.ok().cacheControl(CacheControl.noStore()).body(body); }
}
