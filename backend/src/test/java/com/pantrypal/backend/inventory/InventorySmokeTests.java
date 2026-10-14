package com.pantrypal.backend.inventory;

import com.pantrypal.backend.inventory.repository.IngredientRepository;
import com.pantrypal.backend.inventory.repository.InventoryMovementRepository;
import com.pantrypal.backend.inventory.repository.StockBatchRepository;
import com.pantrypal.backend.user.entity.AppUser;
import com.pantrypal.backend.user.entity.Role;
import com.pantrypal.backend.user.repository.UserRepository;
import java.math.BigDecimal;
import java.security.SecureRandom;
import java.time.LocalDate;
import java.util.Base64;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.webmvc.test.autoconfigure.MockMvcPrint;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.databind.ObjectMapper;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/** Opt-in smoke tests: run against a disposable PostgreSQL database, never a shared database.
 * Flyway migration and Hibernate schema validation run during startup. Test data rolls back.
 */
@SpringBootTest(properties = "pantrypal.bootstrap.enabled=false")
@AutoConfigureMockMvc(print = MockMvcPrint.NONE)
@EnabledIfEnvironmentVariable(named = "PANTRYPAL_INVENTORY_SMOKE", matches = "true")
@Transactional
class InventorySmokeTests {
    @Autowired MockMvc mvc;
    @Autowired ObjectMapper mapper;
    @Autowired UserRepository users;
    @Autowired PasswordEncoder passwords;
    @Autowired IngredientRepository ingredients;
    @Autowired StockBatchRepository batches;
    @Autowired InventoryMovementRepository movements;

    @DynamicPropertySource
    static void ephemeralKey(DynamicPropertyRegistry registry) {
        String database = System.getenv("DB_URL");
        if (database == null || !database.matches("jdbc:postgresql://127\\.0\\.0\\.1:[0-9]+/pantrypal_inventory_smoke")) {
            throw new IllegalStateException("Inventory smoke tests require the disposable localhost database pantrypal_inventory_smoke.");
        }
        byte[] key = new byte[32]; new SecureRandom().nextBytes(key);
        registry.add("pantrypal.auth.jwt-secret", () -> Base64.getEncoder().encodeToString(key));
    }

    private String login(Role role) throws Exception {
        String password = UUID.randomUUID().toString();
        String email = UUID.randomUUID() + "@example.invalid";
        users.saveAndFlush(new AppUser(UUID.randomUUID(), "Smoke Test", email, passwords.encode(password), role, true));
        String response = mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(java.util.Map.of("email", email, "password", password))))
                .andExpect(status().isOk()).andReturn().getResponse().getContentAsString();
        return mapper.readTree(response).get("accessToken").asText();
    }

    @Test
    void createsListsReceivesAndAdjustsRealStock() throws Exception {
        String token = login(Role.INVENTORY_STAFF);
        String body = """
                {"ingredient":{"name":"Smoke flour","category":"FLOUR_AND_GRAINS","unit":"KG",
                "storageLocation":"PANTRY","minimumStock":"2"},"initialQuantity":"5","expiryDate":"%s"}
                """.formatted(LocalDate.now().plusDays(10));
        var created = mvc.perform(post("/api/inventory/ingredients").header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isCreated()).andExpect(jsonPath("$.quantity").value("5.000000"))
                .andExpect(jsonPath("$.lowStock").value(false)).andReturn().getResponse().getContentAsString();
        String id = mapper.readTree(created).get("id").asText();
        String endpoint = "/api/inventory/ingredients/" + id;
        mvc.perform(get("/api/inventory/ingredients").param("search", "flour").param("storageLocation", "PANTRY")
                .header("Authorization", "Bearer " + token)).andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements").value(1)).andExpect(jsonPath("$.items[0].name").value("Smoke flour"));
        mvc.perform(post(endpoint + "/intake").header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON).content("""
                {"quantity":"1000","unit":"G","expiryDate":"%s","reason":"Smoke intake"}
                """.formatted(LocalDate.now().plusDays(5))))
                .andExpect(status().isOk()).andExpect(jsonPath("$.quantity").value("6.000000"))
                .andExpect(jsonPath("$.nextExpiryDate").value(LocalDate.now().plusDays(5).toString()));
        mvc.perform(post(endpoint + "/adjustments").header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON).content("""
                {"quantityDelta":"-4.5","unit":"KG","reason":"Smoke adjustment"}
                """))
                .andExpect(status().isOk()).andExpect(jsonPath("$.quantity").value("1.500000"))
                .andExpect(jsonPath("$.lowStock").value(true));
        mvc.perform(post(endpoint + "/adjustments").header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON).content("""
                {"quantityDelta":"-2","unit":"KG","reason":"Must be rejected"}
                """))
                .andExpect(status().isConflict()).andExpect(jsonPath("$.code").value("INSUFFICIENT_STOCK"));
        assertThat(ingredients.findById(UUID.fromString(id)).orElseThrow().getQuantity()).isEqualByComparingTo("1.5");
        assertThat(batches.available(UUID.fromString(id)).stream().map(b -> b.getRemainingQuantity()).reduce(BigDecimal.ZERO, BigDecimal::add))
                .isEqualByComparingTo("1.5");
        assertThat(movements.count()).isEqualTo(3);
        mvc.perform(get("/api/inventory/ingredients").param("lowStock", "true")
                .header("Authorization", "Bearer " + token)).andExpect(status().isOk()).andExpect(jsonPath("$.totalElements").value(1));
        mvc.perform(delete(endpoint).header("Authorization", "Bearer " + token)).andExpect(status().isForbidden());
        String manager = login(Role.MANAGER);
        mvc.perform(delete(endpoint).header("Authorization", "Bearer " + manager)).andExpect(status().isConflict());
        mvc.perform(put(endpoint).header("Authorization", "Bearer " + manager).contentType(MediaType.APPLICATION_JSON)
                .content("""
                {"name":"Smoke renamed flour","category":"FLOUR_AND_GRAINS","unit":"KG","storageLocation":"FREEZER","minimumStock":"1.5"}
                """))
                .andExpect(status().isOk()).andExpect(jsonPath("$.quantity").value("1.500000"))
                .andExpect(jsonPath("$.lowStock").value(false));
        mvc.perform(post(endpoint + "/adjustments").header("Authorization", "Bearer " + manager)
                .contentType(MediaType.APPLICATION_JSON).content("""
                {"quantityDelta":"-1.5","unit":"KG","reason":"Empty remaining smoke stock"}
                """))
                .andExpect(status().isOk());
        mvc.perform(delete(endpoint).header("Authorization", "Bearer " + manager)).andExpect(status().isNoContent());
        mvc.perform(get(endpoint).header("Authorization", "Bearer " + manager)).andExpect(status().isNotFound());
        assertThat(movements.count()).isEqualTo(4);
    }

    @Test
    void rejectsAnonymousOrderStaffAndInvalidInput() throws Exception {
        String id = UUID.randomUUID().toString();
        String base = "/api/inventory/ingredients/" + id;
        mvc.perform(get("/api/inventory/ingredients")).andExpect(status().isUnauthorized());
        mvc.perform(post("/api/inventory/ingredients").contentType(MediaType.APPLICATION_JSON).content("{}"))
                .andExpect(status().isUnauthorized());
        mvc.perform(post(base + "/adjustments").contentType(MediaType.APPLICATION_JSON).content("{}"))
                .andExpect(status().isUnauthorized());
        String order = login(Role.ORDER_STAFF);
        mvc.perform(get("/api/inventory/ingredients").header("Authorization", "Bearer " + order)).andExpect(status().isForbidden());
        mvc.perform(post("/api/inventory/ingredients").header("Authorization", "Bearer " + order)
                .contentType(MediaType.APPLICATION_JSON).content("{}"))
                .andExpect(status().isForbidden());
        mvc.perform(post(base + "/adjustments").header("Authorization", "Bearer " + order)
                .contentType(MediaType.APPLICATION_JSON).content("{}"))
                .andExpect(status().isForbidden());
        String staff = login(Role.INVENTORY_STAFF);
        mvc.perform(post("/api/inventory/ingredients").header("Authorization", "Bearer " + staff)
                .contentType(MediaType.APPLICATION_JSON).content("""
                {"ingredient":{"name":" ","category":"OTHER","unit":"KG","storageLocation":"PANTRY","minimumStock":"-1"},"initialQuantity":"-2"}
                """))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.code").value("INVALID_REQUEST"));
        assertThat(ingredients.count()).isZero();
    }
}
