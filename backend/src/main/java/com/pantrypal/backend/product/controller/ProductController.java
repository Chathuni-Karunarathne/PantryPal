package com.pantrypal.backend.product.controller;

import com.pantrypal.backend.product.dto.*;
import com.pantrypal.backend.product.service.ProductService;
import jakarta.validation.Valid;
import java.net.URI;
import java.util.UUID;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/products")
@PreAuthorize("hasAnyRole('OWNER_ADMIN', 'MANAGER', 'ORDER_STAFF', 'INVENTORY_STAFF')")
public class ProductController {
    private final ProductService service;
    public ProductController(ProductService service) { this.service = service; }

    @GetMapping("/categories")
    public ResponseEntity<?> categories() { return ok(service.categories()); }
    @PostMapping("/categories")
    @PreAuthorize("hasAnyRole('OWNER_ADMIN', 'MANAGER')")
    public ResponseEntity<?> createCategory(@Valid @RequestBody CategoryRequest request) {
        var category = service.createCategory(request);
        return ResponseEntity.created(URI.create("/api/products/categories/" + category.id()))
                .cacheControl(CacheControl.noStore()).body(category);
    }
    @PutMapping("/categories/{id}")
    @PreAuthorize("hasAnyRole('OWNER_ADMIN', 'MANAGER')")
    public ResponseEntity<?> updateCategory(@PathVariable UUID id, @Valid @RequestBody CategoryRequest request) {
        return ok(service.updateCategory(id, request));
    }
    @GetMapping("/overview")
    public ResponseEntity<?> overview() { return ok(service.overview()); }
    @GetMapping
    public ResponseEntity<?> list(@RequestParam(required = false) String search,
                                 @RequestParam(required = false) UUID categoryId,
                                 @RequestParam(required = false) Boolean active,
                                 @RequestParam(defaultValue = "0") int page,
                                 @RequestParam(defaultValue = "25") int size) {
        return ok(service.list(search, categoryId, active, page, size));
    }
    @GetMapping("/{id}")
    public ResponseEntity<ProductResponse> get(@PathVariable UUID id) { return ok(service.get(id)); }
    @PostMapping
    @PreAuthorize("hasAnyRole('OWNER_ADMIN', 'MANAGER')")
    public ResponseEntity<ProductResponse> create(@Valid @RequestBody ProductRequest request) {
        var product = service.create(request);
        return ResponseEntity.created(URI.create("/api/products/" + product.id())).cacheControl(CacheControl.noStore()).body(product);
    }
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('OWNER_ADMIN', 'MANAGER')")
    public ResponseEntity<ProductResponse> update(@PathVariable UUID id, @Valid @RequestBody ProductRequest request) {
        return ok(service.update(id, request));
    }
    @PutMapping("/{id}/availability")
    @PreAuthorize("hasAnyRole('OWNER_ADMIN', 'MANAGER')")
    public ResponseEntity<ProductResponse> availability(@PathVariable UUID id, @Valid @RequestBody AvailabilityRequest request) {
        return ok(service.availability(id, request.active()));
    }
    @GetMapping("/{id}/recipe")
    @PreAuthorize("hasAnyRole('OWNER_ADMIN', 'MANAGER')")
    public ResponseEntity<RecipeResponse> recipe(@PathVariable UUID id) { return ok(service.recipe(id)); }
    @PutMapping("/{id}/recipe")
    @PreAuthorize("hasAnyRole('OWNER_ADMIN', 'MANAGER')")
    public ResponseEntity<RecipeResponse> saveRecipe(@PathVariable UUID id, @Valid @RequestBody RecipeRequest request) {
        return ok(service.saveRecipe(id, request));
    }
    private <T> ResponseEntity<T> ok(T body) { return ResponseEntity.ok().cacheControl(CacheControl.noStore()).body(body); }
}
