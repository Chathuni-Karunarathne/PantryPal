package com.pantrypal.backend.product.service;

import com.pantrypal.backend.inventory.entity.Ingredient;
import com.pantrypal.backend.inventory.repository.IngredientRepository;
import com.pantrypal.backend.product.dto.*;
import com.pantrypal.backend.product.entity.*;
import com.pantrypal.backend.product.repository.*;
import jakarta.persistence.criteria.Predicate;
import java.math.BigDecimal;
import java.util.*;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class ProductService {
    private static final BigDecimal MAX_QUANTITY = new BigDecimal("9999999999999.999999");
    private final ProductRepository products;
    private final ProductCategoryRepository categories;
    private final RecipeRepository recipes;
    private final IngredientRepository ingredients;

    public ProductService(ProductRepository products, ProductCategoryRepository categories,
                          RecipeRepository recipes, IngredientRepository ingredients) {
        this.products = products; this.categories = categories; this.recipes = recipes; this.ingredients = ingredients;
    }

    public record CategoryResponse(UUID id, String name) {}
    public record ProductPage(List<ProductResponse> items, int page, int size, long totalElements, int totalPages) {}
    public record Overview(long totalProducts, long activeProducts, long recipes) {}

    public List<CategoryResponse> categories() {
        return categories.findAll(Sort.by("name")).stream().map(c -> new CategoryResponse(c.getId(), c.getName())).toList();
    }

    @Transactional
    public CategoryResponse createCategory(CategoryRequest request) {
        var category = new ProductCategory(request.name());
        uniqueCategory(category.getName(), category.getId());
        categories.saveAndFlush(category);
        return new CategoryResponse(category.getId(), category.getName());
    }

    @Transactional
    public CategoryResponse updateCategory(UUID id, CategoryRequest request) {
        var category = category(id);
        uniqueCategory(request.name().strip(), id);
        category.rename(request.name()); categories.flush();
        return new CategoryResponse(id, category.getName());
    }

    private void uniqueCategory(String name, UUID id) {
        if (categories.existsByNameIgnoreCaseAndIdNot(name, id)) {
            throw new ProductException(409, "DUPLICATE_CATEGORY", "A category with this name already exists.");
        }
    }

    public Overview overview() {
        return new Overview(products.count(), products.count((root, query, cb) -> cb.isTrue(root.get("active"))), recipes.count());
    }

    public ProductPage list(String search, UUID categoryId, Boolean active, int page, int size) {
        if (page < 0 || size < 1 || size > 100 || (search != null && search.length() > 120)) {
            throw new ProductException(400, "INVALID_FILTER", "Use a valid search, page, and page size (1–100).");
        }
        Specification<Product> filter = (root, query, cb) -> {
            var conditions = new ArrayList<Predicate>();
            if (search != null && !search.isBlank()) {
                String escaped = search.strip().toLowerCase(Locale.ROOT).replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_");
                conditions.add(cb.like(cb.lower(root.get("name")), "%" + escaped + "%", '\\'));
            }
            if (categoryId != null) conditions.add(cb.equal(root.get("category").get("id"), categoryId));
            if (active != null) conditions.add(cb.equal(root.get("active"), active));
            return cb.and(conditions.toArray(Predicate[]::new));
        };
        var result = products.findAll(filter, PageRequest.of(page, size, Sort.by("name", "id")));
        return new ProductPage(result.getContent().stream().map(this::response).toList(), page, size,
                result.getTotalElements(), result.getTotalPages());
    }

    public ProductResponse get(UUID id) { return response(product(id)); }

    @Transactional
    public ProductResponse create(ProductRequest request) {
        var product = products.saveAndFlush(new Product(request.name(), request.description(), category(request.categoryId()),
                request.sellingPrice(), request.active()));
        return response(product);
    }

    @Transactional
    public ProductResponse update(UUID id, ProductRequest request) {
        var product = lock(id);
        product.update(request.name(), request.description(), category(request.categoryId()), request.sellingPrice(), request.active());
        products.flush();
        return response(product);
    }

    @Transactional
    public ProductResponse availability(UUID id, boolean active) {
        var product = lock(id); product.setActive(active); products.flush();
        return response(product);
    }

    // Quantities describe the full recipe yield; future orders scale by ordered quantity / yield.
    public RecipeResponse recipe(UUID productId) {
        product(productId);
        return recipes.findByProduct_Id(productId).map(this::recipeResponse).orElseThrow(() ->
                new ProductException(404, "RECIPE_NOT_FOUND", "This product does not have a recipe yet."));
    }

    @Transactional
    public RecipeResponse saveRecipe(UUID productId, RecipeRequest request) {
        // Product lock serializes recipe creation and edits, including first-time saves.
        var product = lock(productId);
        var selected = new LinkedHashMap<UUID, RecipeRequest.Line>();
        for (var line : request.ingredients()) {
            if (selected.putIfAbsent(line.ingredientId(), line) != null) {
                throw new ProductException(400, "DUPLICATE_INGREDIENT", "Use each ingredient once in a recipe.");
            }
        }
        // Lock in deterministic ID order, matching inventory's archive/update lock.
        // No inventory fields, batches or movement records are changed here.
        var validated = new HashMap<UUID, Ingredient>();
        for (var id : selected.keySet().stream().sorted().toList()) {
            var ingredient = ingredients.lockActive(id).orElseThrow(() ->
                    new ProductException(400, "INVALID_INGREDIENT", "An ingredient is missing or archived. Select an active inventory ingredient."));
            var line = selected.get(id);
            var normalized = line.unit().convert(line.quantity(), ingredient.getUnit());
            if (normalized.signum() <= 0 || normalized.compareTo(MAX_QUANTITY) > 0) {
                throw new ProductException(400, "INVALID_QUANTITY", "The quantity must fit the ingredient's stock unit with up to six decimal places.");
            }
            validated.put(id, ingredient);
        }
        var recipe = recipes.findByProduct_Id(productId).orElseGet(() -> new Recipe(product));
        recipe.updateYield(request.yieldQuantity(), request.yieldDescription());
        recipe.retainIngredients(selected.keySet());
        selected.forEach((id, line) -> recipe.putIngredient(validated.get(id), line.quantity(), line.unit()));
        var saved = recipes.save(recipe);
        product.setRecipe(saved);
        recipes.flush();
        return recipeResponse(saved);
    }

    private Product product(UUID id) { return products.findById(id).orElseThrow(this::missingProduct); }
    private Product lock(UUID id) { return products.lockById(id).orElseThrow(this::missingProduct); }
    private ProductException missingProduct() { return new ProductException(404, "PRODUCT_NOT_FOUND", "This product could not be found."); }
    private ProductCategory category(UUID id) { return categories.findById(id).orElseThrow(() ->
            new ProductException(400, "INVALID_CATEGORY", "Choose an existing product category.")); }

    private ProductResponse response(Product p) {
        return new ProductResponse(p.getId(), p.getName(), p.getDescription(), p.getCategory().getId(), p.getCategory().getName(),
                p.getSellingPrice().toPlainString(), p.isActive(), p.getRecipe() != null, p.getCreatedAt(), p.getUpdatedAt());
    }
    private RecipeResponse recipeResponse(Recipe recipe) {
        var lines = recipe.getIngredients().stream().sorted(Comparator.comparing(line -> line.getIngredient().getName()))
                .map(line -> new RecipeResponse.Line(line.getIngredient().getId(), line.getIngredient().getName(),
                        line.getQuantity().toPlainString(), line.getUnit(),
                        line.getUnit().convert(line.getQuantity(), line.getIngredient().getUnit()).toPlainString(),
                        line.getIngredient().getUnit(), line.getIngredient().isArchived())).toList();
        return new RecipeResponse(recipe.getId(), recipe.getProductId(), recipe.getYieldQuantity().toPlainString(),
                recipe.getYieldDescription(), lines, recipe.getUpdatedAt());
    }
}
