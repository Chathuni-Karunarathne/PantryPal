package com.pantrypal.backend.auth;

import com.pantrypal.backend.auth.controller.AuthenticationController;
import com.pantrypal.backend.auth.dto.LoginResponse;
import com.pantrypal.backend.auth.entity.AuthSession;
import com.pantrypal.backend.auth.repository.AuthSessionRepository;
import com.pantrypal.backend.auth.service.AuthenticationService;
import com.pantrypal.backend.common.exception.ApiExceptionHandler;
import com.pantrypal.backend.common.exception.SecurityErrorHandler;
import com.pantrypal.backend.security.SessionAuthenticationConverter;
import com.pantrypal.backend.security.config.SecurityConfiguration;
import com.pantrypal.backend.security.jwt.JwtConfiguration;
import com.pantrypal.backend.security.jwt.TokenService;
import com.pantrypal.backend.user.entity.AppUser;
import com.pantrypal.backend.user.entity.Role;
import com.pantrypal.backend.user.repository.UserRepository;
import com.pantrypal.backend.user.service.PantryUserDetailsService;
import java.security.SecureRandom;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.EnumSource;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.webmvc.test.autoconfigure.MockMvcPrint;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.*;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.servlet.MockMvc;
import tools.jackson.databind.ObjectMapper;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

// Real controllers, security filters, password verification and signed JWTs.
// Only persistence and time are isolated; this does not verify PostgreSQL locking/schema.
@WebMvcTest(AuthenticationController.class)
@AutoConfigureMockMvc(print = MockMvcPrint.NONE)
@Import({SecurityConfiguration.class, JwtConfiguration.class, TokenService.class,
        AuthenticationService.class, PantryUserDetailsService.class,
        SessionAuthenticationConverter.class, SecurityErrorHandler.class, ApiExceptionHandler.class})
class AuthenticationSecurityTests {
    @Autowired MockMvc mvc;
    @Autowired ObjectMapper mapper;
    @Autowired PasswordEncoder passwords;
    @Autowired JwtDecoder decoder;
    @Autowired JwtEncoder encoder;
    @Autowired TokenService tokens;
    @MockitoBean UserRepository users;
    @MockitoBean AuthSessionRepository sessions;
    @MockitoBean Clock clock;

    private final Map<UUID, AuthSession> storedSessions = new HashMap<>();
    private final Map<String, AppUser> storedUsers = new HashMap<>();
    private Instant now;
    private String password;
    private AppUser user;

    @DynamicPropertySource
    static void testKey(DynamicPropertyRegistry registry) {
        byte[] key = new byte[32];
        new SecureRandom().nextBytes(key);
        String encoded = Base64.getEncoder().encodeToString(key);
        registry.add("pantrypal.auth.jwt-secret", () -> encoded);
    }

    @BeforeEach
    void setUp() {
        now = Instant.now();
        when(clock.instant()).thenAnswer(invocation -> now);
        password = UUID.randomUUID().toString();
        user = new AppUser(UUID.randomUUID(), "Test Staff", "staff@example.invalid",
                passwords.encode(password), Role.MANAGER, true);
        storedUsers.put(user.getEmail(), user);
        when(users.findByEmail(anyString())).thenAnswer(invocation ->
                Optional.ofNullable(storedUsers.get(invocation.getArgument(0))));
        when(sessions.save(any(AuthSession.class))).thenAnswer(invocation -> {
            AuthSession session = invocation.getArgument(0);
            storedSessions.put(session.getId(), session);
            return session;
        });
        when(sessions.findWithUserById(any())).thenAnswer(invocation ->
                Optional.ofNullable(storedSessions.get(invocation.getArgument(0))));
        when(sessions.lockById(any())).thenAnswer(invocation ->
                Optional.ofNullable(storedSessions.get(invocation.getArgument(0))));
        when(sessions.lockByRefreshTokenHash(anyString())).thenAnswer(invocation ->
                storedSessions.values().stream().filter(session ->
                        session.getRefreshTokenHash().equals(invocation.getArgument(0))).findFirst());
    }

    private LoginResponse login() throws Exception {
        return mapper.readValue(mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(Map.of("email", user.getEmail(), "password", password))))
                .andExpect(status().isOk()).andExpect(header().string("Cache-Control", "no-store"))
                .andExpect(jsonPath("$.user.passwordHash").doesNotExist())
                .andExpect(jsonPath("$.user.password").doesNotExist())
                .andReturn().getResponse().getContentAsString(), LoginResponse.class);
    }

    private String refreshBody(String token) { return mapper.writeValueAsString(Map.of("refreshToken", token)); }

    @Test
    void loginUsesPasswordEncoderAndStoresOnlyRefreshDigest() throws Exception {
        assertThat(user.getPasswordHash().equals(password)).isFalse();
        assertThat(passwords.matches(password, user.getPasswordHash())).isTrue();
        var response = login();
        assertThat(response.tokenType()).isEqualTo("Bearer");
        assertThat(response.refreshToken().matches("[A-Za-z0-9_-]{43}")).isTrue();
        var jwt = decoder.decode(response.accessToken());
        assertThat(jwt.getSubject()).isEqualTo(user.getId().toString());
        assertThat(jwt.getAudience()).containsExactly("pantrypal-api");
        assertThat(jwt.getClaimAsString("token_type")).isEqualTo("access");
        var session = storedSessions.get(UUID.fromString(jwt.getClaimAsString("sid")));
        assertThat(session.getRefreshTokenHash().equals(tokens.hashRefreshToken(response.refreshToken()))).isTrue();
        assertThat(session.getRefreshTokenHash().equals(response.refreshToken())).isFalse();
        assertThat(jwt.getExpiresAt().isAfter(now)).isTrue();
        assertThat(response.user().role()).isEqualTo(Role.MANAGER);
    }

    @Test
    void unknownEmailWrongPasswordAndInactiveAccountShareGenericError() throws Exception {
        for (String email : List.of(user.getEmail(), "missing@example.invalid")) {
            mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                            .content(mapper.writeValueAsString(Map.of("email", email, "password", UUID.randomUUID().toString()))))
                    .andExpect(status().isUnauthorized()).andExpect(jsonPath("$.code").value("INVALID_CREDENTIALS"))
                    .andExpect(jsonPath("$.message").value("Unable to sign in with these credentials."));
        }
        ReflectionTestUtils.setField(user, "enabled", false);
        mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(Map.of("email", user.getEmail(), "password", password))))
                .andExpect(status().isUnauthorized()).andExpect(jsonPath("$.code").value("INVALID_CREDENTIALS"));
        verify(sessions, never()).save(any());
    }

    @ParameterizedTest
    @ValueSource(strings = {"{}", "{", "{\"email\":\"invalid\",\"password\":\"x\"}",
            "{\"email\":\"staff@example.invalid\",\"password\":\" \"}"})
    void malformedAndInvalidLoginRequestsAreRejected(String body) throws Exception {
        mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.code").value("INVALID_REQUEST"));
        verifyNoInteractions(users, sessions);
    }

    @Test
    void normalizedEmailAuthenticates() throws Exception {
        mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(Map.of("email", "STAFF@example.invalid", "password", password))))
                .andExpect(status().isOk()).andExpect(jsonPath("$.user.email").value(user.getEmail()));
    }

    @Test
    void unauthenticatedMeAndLogoutAreProtected() throws Exception {
        mvc.perform(get("/api/auth/me")).andExpect(status().isUnauthorized());
        mvc.perform(post("/api/auth/logout")).andExpect(status().isUnauthorized());
    }

    @ParameterizedTest
    @EnumSource(Role.class)
    void profileReturnsAuthoritativeRoleForEverySupportedRole(Role role) throws Exception {
        var response = login();
        // Change the database fixture after issuing JWT; roles must not come from stale claims.
        ReflectionTestUtils.setField(user, "role", role);
        mvc.perform(get("/api/auth/me").header("Authorization", "Bearer " + response.accessToken()))
                .andExpect(status().isOk()).andExpect(jsonPath("$.id").value(user.getId().toString()))
                .andExpect(jsonPath("$.role").value(role.name()))
                .andExpect(jsonPath("$.passwordHash").doesNotExist());
        var admin = mvc.perform(get("/api/admin/not-implemented").header("Authorization", "Bearer " + response.accessToken()));
        // No admin endpoint is invented: staff are stopped by Security; owner reaches routing (404).
        admin.andExpect(role == Role.OWNER_ADMIN ? status().isNotFound() : status().isForbidden());
    }

    @Test
    void invalidAndExpiredAccessTokensAreRejected() throws Exception {
        mvc.perform(get("/api/auth/me").header("Authorization", "Bearer invalid"))
                .andExpect(status().isUnauthorized());
        var response = login();
        String[] parts = response.accessToken().split("\\.");
        parts[2] = (parts[2].startsWith("A") ? "B" : "A") + parts[2].substring(1);
        mvc.perform(get("/api/auth/me").header("Authorization", "Bearer " + String.join(".", parts)))
                .andExpect(status().isUnauthorized());
        now = now.plus(Duration.ofMinutes(16));
        mvc.perform(get("/api/auth/me").header("Authorization", "Bearer " + response.accessToken()))
                .andExpect(status().isUnauthorized());
    }

    @ParameterizedTest
    @ValueSource(strings = {"issuer", "audience", "subject", "sid", "token_type", "issuedAt"})
    void signedTokensWithInvalidRequiredClaimsAreRejected(String field) throws Exception {
        var response = login();
        var original = decoder.decode(response.accessToken());
        var claims = JwtClaimsSet.builder().issuer("pantrypal").audience(List.of("pantrypal-api"))
                .subject(original.getSubject()).issuedAt(now).expiresAt(now.plusSeconds(60))
                .claim("sid", original.getClaimAsString("sid")).claim("token_type", "access");
        switch (field) {
            case "issuer" -> claims.issuer("other");
            case "audience" -> claims.audience(List.of("other"));
            case "subject" -> claims.subject(UUID.randomUUID().toString());
            case "sid" -> claims.claim("sid", "invalid");
            case "token_type" -> claims.claim("token_type", "refresh");
            case "issuedAt" -> claims.issuedAt(now.plusSeconds(30));
            default -> throw new AssertionError("Unexpected claim");
        }
        var token = encoder.encode(JwtEncoderParameters.from(JwsHeader.with(MacAlgorithm.HS256).build(), claims.build()));
        mvc.perform(get("/api/auth/me").header("Authorization", "Bearer " + token.getTokenValue()))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void refreshRotatesTokenAndRejectsReuseWithoutExtendingSession() throws Exception {
        var original = login();
        now = now.plus(Duration.ofMinutes(16));
        var rotated = mapper.readValue(mvc.perform(post("/api/auth/refresh").contentType(MediaType.APPLICATION_JSON)
                        .content(refreshBody(original.refreshToken())))
                .andExpect(status().isOk()).andReturn().getResponse().getContentAsString(), LoginResponse.class);
        assertThat(rotated.refreshToken().equals(original.refreshToken())).isFalse();
        assertThat(rotated.refreshExpiresAt()).isEqualTo(original.refreshExpiresAt());
        mvc.perform(get("/api/auth/me").header("Authorization", "Bearer " + rotated.accessToken()))
                .andExpect(status().isOk());
        mvc.perform(post("/api/auth/refresh").contentType(MediaType.APPLICATION_JSON).content(refreshBody(original.refreshToken())))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void unknownMalformedExpiredAndInactiveRefreshSessionsFailSafely() throws Exception {
        mvc.perform(post("/api/auth/refresh").contentType(MediaType.APPLICATION_JSON).content(refreshBody("invalid")))
                .andExpect(status().isBadRequest());
        mvc.perform(post("/api/auth/refresh").contentType(MediaType.APPLICATION_JSON).content(refreshBody(tokens.newRefreshToken())))
                .andExpect(status().isUnauthorized());
        var response = login();
        ReflectionTestUtils.setField(user, "enabled", false);
        mvc.perform(post("/api/auth/refresh").contentType(MediaType.APPLICATION_JSON).content(refreshBody(response.refreshToken())))
                .andExpect(status().isUnauthorized());
        ReflectionTestUtils.setField(user, "enabled", true);
        now = now.plus(Duration.ofDays(8));
        mvc.perform(post("/api/auth/refresh").contentType(MediaType.APPLICATION_JSON).content(refreshBody(response.refreshToken())))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void refreshedAccessExpiryCannotExceedRefreshSessionExpiry() throws Exception {
        var response = login();
        now = response.refreshExpiresAt().minusSeconds(30);
        var rotated = mapper.readValue(mvc.perform(post("/api/auth/refresh").contentType(MediaType.APPLICATION_JSON)
                        .content(refreshBody(response.refreshToken())))
                .andExpect(status().isOk()).andReturn().getResponse().getContentAsString(), LoginResponse.class);
        assertThat(rotated.expiresAt()).isEqualTo(response.refreshExpiresAt());
    }

    @Test
    void logoutRevokesAccessAndRefreshForTheSession() throws Exception {
        var response = login();
        mvc.perform(post("/api/auth/logout").header("Authorization", "Bearer " + response.accessToken()))
                .andExpect(status().isNoContent());
        mvc.perform(get("/api/auth/me").header("Authorization", "Bearer " + response.accessToken()))
                .andExpect(status().isUnauthorized());
        mvc.perform(post("/api/auth/refresh").contentType(MediaType.APPLICATION_JSON).content(refreshBody(response.refreshToken())))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void deactivationRejectsPreviouslyIssuedAccessToken() throws Exception {
        var response = login();
        ReflectionTestUtils.setField(user, "enabled", false);
        mvc.perform(get("/api/auth/me").header("Authorization", "Bearer " + response.accessToken()))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void corsAllowsOnlyConfiguredFrontendOrigin() throws Exception {
        mvc.perform(options("/api/auth/login").header("Origin", "http://localhost:3000")
                        .header("Access-Control-Request-Method", "POST"))
                .andExpect(status().isOk()).andExpect(header().string("Access-Control-Allow-Origin", "http://localhost:3000"))
                .andExpect(header().doesNotExist("Access-Control-Allow-Credentials"));
        mvc.perform(options("/api/auth/login").header("Origin", "https://untrusted.example")
                        .header("Access-Control-Request-Method", "POST"))
                .andExpect(status().isForbidden()).andExpect(header().doesNotExist("Access-Control-Allow-Origin"));
    }

    @Test
    void internalFailuresDoNotExposeExceptionDetails() throws Exception {
        when(users.findByEmail(anyString())).thenThrow(new IllegalStateException("Private database diagnostic"));
        mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(Map.of("email", user.getEmail(), "password", password))))
                .andExpect(status().isInternalServerError()).andExpect(jsonPath("$.message").value("An unexpected error occurred."))
                .andExpect(jsonPath("$.trace").doesNotExist());
    }
}
