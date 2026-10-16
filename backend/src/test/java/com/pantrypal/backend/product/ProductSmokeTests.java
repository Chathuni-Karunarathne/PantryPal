package com.pantrypal.backend.product;

import com.pantrypal.backend.inventory.repository.*;
import com.pantrypal.backend.product.repository.*;
import com.pantrypal.backend.user.entity.*;
import com.pantrypal.backend.user.repository.UserRepository;
import java.math.BigDecimal;
import java.security.SecureRandom;
import java.util.*;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.*;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.*;
import org.springframework.test.web.servlet.*;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.databind.ObjectMapper;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/** Opt-in checks against a disposable localhost database. All test records roll back. */
@SpringBootTest(properties = "pantrypal.bootstrap.enabled=false")
@AutoConfigureMockMvc(print = MockMvcPrint.NONE)
@EnabledIfEnvironmentVariable(named = "PANTRYPAL_PRODUCT_SMOKE", matches = "true")
@Transactional
class ProductSmokeTests {
    @Autowired MockMvc mvc;
    @Autowired ObjectMapper mapper;
    @Autowired UserRepository users;
    @Autowired PasswordEncoder passwords;
    @Autowired IngredientRepository ingredients;
    @Autowired InventoryMovementRepository movements;
    @Autowired StockBatchRepository batches;
    @Autowired RecipeRepository recipes;
    @Autowired ProductRepository products;

    @DynamicPropertySource
    static void localDatabaseOnly(DynamicPropertyRegistry registry) {
        String database = System.getenv("DB_URL");
        if (database == null || !database.matches("jdbc:postgresql://127\\.0\\.0\\.1:[0-9]+/pantrypal_products_smoke")) {
            throw new IllegalStateException("Use the disposable localhost database pantrypal_products_smoke for product smoke tests.");
        }
        byte[] key = new byte[32]; new SecureRandom().nextBytes(key);
        registry.add("pantrypal.auth.jwt-secret", () -> Base64.getEncoder().encodeToString(key));
    }

    private String login(Role role) throws Exception {
        String password = UUID.randomUUID().toString();
        String email = UUID.randomUUID() + "@example.invalid";
        users.saveAndFlush(new AppUser(UUID.randomUUID(), "Product Smoke", email, passwords.encode(password), role, true));
        var response = mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(Map.of("email", email, "password", password))))
                .andExpect(status().isOk()).andReturn().getResponse().getContentAsString();
        return mapper.readTree(response).get("accessToken").asText();
    }

    private String create(String path, String body, String token) throws Exception {
        var result = mvc.perform(post(path).header("Authorization", "Bearer " + token).contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString();
        return mapper.readTree(result).get("id").asText();
    }

    private String ingredient(String name, String token) throws Exception {
        return create("/api/inventory/ingredients", """
                {"ingredient":{"name":"%s","category":"OTHER","unit":"KG","storageLocation":"PANTRY","minimumStock":"1"},"initialQuantity":"5"}
                """.formatted(name), token);
    }
    private String product(String category, String token) throws Exception {
        return create("/api/products", productBody(category, "Butter Cake"), token);
    }
    private String productBody(String category, String name) {
        return """
                {"name":"%s","description":"A kitchen favorite","categoryId":"%s","sellingPrice":"1250.50","active":true}
                """.formatted(name, category);
    }
    private String recipeBody(String ingredient, String quantity, String unit) {
        return """
                {"yieldQuantity":"2","yieldDescription":"1 kg cakes","ingredients":[{"ingredientId":"%s","quantity":"%s","unit":"%s"}]}
                """.formatted(ingredient, quantity, unit);
    }
    private ResultActions saveRecipe(String product, String body, String token) throws Exception {
        return mvc.perform(put("/api/products/" + product + "/recipe").header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON).content(body));
    }

    @Test
    void createsSearchesEditsAndDeactivatesProductsAndRecipesWithoutStockChanges() throws Exception {
        String token = login(Role.MANAGER);
        String category = create("/api/products/categories", "{\"name\":\"Smoke bakes\"}", token);
        mvc.perform(put("/api/products/categories/" + category).header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON).content("{\"name\":\"Signature bakes\"}"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.name").value("Signature bakes"));
        mvc.perform(post("/api/products/categories").header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON).content("{\"name\":\" signature BAKES \"}"))
                .andExpect(status().isConflict());
        String product = product(category, token);
        String flour = ingredient("Smoke flour", token);
        String sugar = ingredient("Smoke sugar", token);
        long movementCount = movements.count(), batchCount = batches.count();
        saveRecipe(product, recipeBody(flour, "250", "G"), token).andExpect(status().isOk())
                .andExpect(jsonPath("$.ingredients[0].ingredientId").value(flour))
                .andExpect(jsonPath("$.ingredients[0].stockQuantity").value("0.250000"))
                .andExpect(jsonPath("$.yieldQuantity").value("2"));
        String endpoint = "/api/products/" + product;
        mvc.perform(get("/api/products").param("search", "butter").param("categoryId", category).param("active", "true")
                .header("Authorization", "Bearer " + token)).andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements").value(1)).andExpect(jsonPath("$.items[0].hasRecipe").value(true));
        mvc.perform(put(endpoint).header("Authorization", "Bearer " + token).contentType(MediaType.APPLICATION_JSON)
                .content(productBody(category, "Updated Butter Cake"))).andExpect(status().isOk());
        mvc.perform(get(endpoint + "/recipe").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk()).andExpect(jsonPath("$.ingredients[0].quantity").value("250"));
        saveRecipe(product, """
                {"yieldQuantity":"3","yieldDescription":"1 kg cakes","ingredients":[
                {"ingredientId":"%s","quantity":"500","unit":"G"},
                {"ingredientId":"%s","quantity":"0.2","unit":"KG"}]}
                """.formatted(flour, sugar), token).andExpect(status().isOk()).andExpect(jsonPath("$.ingredients.length()").value(2));
        saveRecipe(product, recipeBody(sugar, "300", "G"), token).andExpect(status().isOk())
                .andExpect(jsonPath("$.ingredients.length()").value(1)).andExpect(jsonPath("$.ingredients[0].ingredientId").value(sugar));
        mvc.perform(put(endpoint + "/availability").header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON).content("{\"active\":false}"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.active").value(false));
        mvc.perform(get(endpoint).header("Authorization", "Bearer " + token)).andExpect(status().isOk())
                .andExpect(jsonPath("$.hasRecipe").value(true)).andExpect(jsonPath("$.active").value(false));
        mvc.perform(get("/api/products").param("active", "true").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk()).andExpect(jsonPath("$.totalElements").value(0));
        assertThat(products.count()).isEqualTo(1);
        assertThat(recipes.count()).isEqualTo(1);
        for (var id : List.of(flour, sugar)) {
            assertThat(ingredients.findById(UUID.fromString(id)).orElseThrow().getQuantity()).isEqualByComparingTo("5");
            assertThat(batches.available(UUID.fromString(id)).stream().map(b -> b.getRemainingQuantity()).reduce(BigDecimal.ZERO, BigDecimal::add))
                    .isEqualByComparingTo("5");
        }
        assertThat(movements.count()).isEqualTo(movementCount);
        assertThat(batches.count()).isEqualTo(batchCount);
    }

    @Test
    void rejectsInvalidProductsAndRecipesAndRetainsTheSavedRecipe() throws Exception {
        String token = login(Role.OWNER_ADMIN);
        String category = create("/api/products/categories", "{\"name\":\"Validation bakes\"}", token);
        mvc.perform(post("/api/products").header("Authorization", "Bearer " + token).contentType(MediaType.APPLICATION_JSON)
                .content(productBody(UUID.randomUUID().toString(), "Invalid"))).andExpect(status().isBadRequest());
        mvc.perform(post("/api/products").header("Authorization", "Bearer " + token).contentType(MediaType.APPLICATION_JSON)
                .content(productBody(category, " ").replace("1250.50", "-1"))).andExpect(status().isBadRequest());
        String product = product(category, token), flour = ingredient("Validation flour", token);
        saveRecipe(product, recipeBody(flour, "250", "G"), token).andExpect(status().isOk());
        for (String quantity : List.of("0", "-1", "0.000001")) {
            saveRecipe(product, recipeBody(flour, quantity, "G"), token).andExpect(status().isBadRequest());
        }
        saveRecipe(product, recipeBody(flour, "250", "ML"), token).andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("INCOMPATIBLE_UNIT"));
        saveRecipe(product, recipeBody(UUID.randomUUID().toString(), "1", "G"), token).andExpect(status().isBadRequest());
        saveRecipe(product, recipeBody(flour, "250", "G").replace("\"yieldQuantity\":\"2\"", "\"yieldQuantity\":\"0\""), token)
                .andExpect(status().isBadRequest());
        saveRecipe(product, """
                {"yieldQuantity":"1","yieldDescription":"cakes","ingredients":[
                {"ingredientId":"%s","quantity":"2","unit":"KG"},
                {"ingredientId":"%s","quantity":"3","unit":"KG"}]}
                """.formatted(flour, flour), token).andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("DUPLICATE_INGREDIENT"));
        saveRecipe(product, "{\"yieldQuantity\":1,\"yieldDescription\":\"cakes\",\"ingredients\":[]}", token)
                .andExpect(status().isBadRequest());
        mvc.perform(get("/api/products/" + product + "/recipe").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk()).andExpect(jsonPath("$.ingredients[0].quantity").value("250"));
    }

    @Test
    void enforcesAnonymousAndStaffPermissions() throws Exception {
        String manager = login(Role.MANAGER);
        String category = create("/api/products/categories", "{\"name\":\"Permission bakes\"}", manager);
        String product = product(category, manager), endpoint = "/api/products/" + product;
        mvc.perform(get("/api/products")).andExpect(status().isUnauthorized());
        mvc.perform(post("/api/products").contentType(MediaType.APPLICATION_JSON).content("{}"))
                .andExpect(status().isUnauthorized());
        mvc.perform(put(endpoint + "/recipe").contentType(MediaType.APPLICATION_JSON).content("{}"))
                .andExpect(status().isUnauthorized());
        for (Role role : List.of(Role.ORDER_STAFF, Role.INVENTORY_STAFF)) {
            String token = login(role);
            mvc.perform(get("/api/products").header("Authorization", "Bearer " + token)).andExpect(status().isOk());
            mvc.perform(get(endpoint).header("Authorization", "Bearer " + token)).andExpect(status().isOk());
            mvc.perform(get(endpoint + "/recipe").header("Authorization", "Bearer " + token)).andExpect(status().isForbidden());
            for (String path : List.of("/api/products", "/api/products/categories")) {
                mvc.perform(post(path).header("Authorization", "Bearer " + token).contentType(MediaType.APPLICATION_JSON).content("{}"))
                        .andExpect(status().isForbidden());
            }
            for (String path : List.of(endpoint, endpoint + "/availability", endpoint + "/recipe", "/api/products/categories/" + category)) {
                mvc.perform(put(path).header("Authorization", "Bearer " + token).contentType(MediaType.APPLICATION_JSON).content("{}"))
                        .andExpect(status().isForbidden());
            }
        }
    }
}
