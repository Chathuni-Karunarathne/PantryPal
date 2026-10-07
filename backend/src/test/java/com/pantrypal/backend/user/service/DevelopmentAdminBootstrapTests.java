package com.pantrypal.backend.user.service;

import com.pantrypal.backend.security.config.SecurityConfiguration;
import com.pantrypal.backend.user.entity.AppUser;
import com.pantrypal.backend.user.entity.Role;
import com.pantrypal.backend.user.repository.UserRepository;
import jakarta.validation.Validation;
import jakarta.validation.ValidatorFactory;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.boot.DefaultApplicationArguments;
import org.springframework.core.env.StandardEnvironment;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DevelopmentAdminBootstrapTests {
    private static final ValidatorFactory validation = Validation.buildDefaultValidatorFactory();
    private static final PasswordEncoder passwords = new SecurityConfiguration().passwordEncoder();
    @Mock UserRepository users;
    private StandardEnvironment environment;
    private String password;

    @AfterAll
    static void closeValidation() { validation.close(); }

    @BeforeEach
    void setUp() {
        environment = new StandardEnvironment();
        environment.setActiveProfiles("dev");
        password = UUID.randomUUID().toString();
    }

    private DevelopmentAdminBootstrap bootstrap(String email, String credential) {
        return new DevelopmentAdminBootstrap(users, passwords, validation.getValidator(), environment,
                email, credential, "Test Administrator");
    }

    @Test
    void newDevelopmentAdminUsesEncodedPassword() {
        when(users.findByEmail("admin@example.invalid")).thenReturn(Optional.empty());
        when(users.insertInitialAdmin(any(), anyString(), anyString(), anyString())).thenReturn(1);
        bootstrap("ADMIN@example.invalid", password).run(new DefaultApplicationArguments());
        var encoded = ArgumentCaptor.forClass(String.class);
        verify(users).insertInitialAdmin(any(), eq("Test Administrator"), eq("admin@example.invalid"), encoded.capture());
        assertThat(encoded.getValue().equals(password)).isFalse();
        assertThat(passwords.matches(password, encoded.getValue())).isTrue();
    }

    @Test
    void existingAdminIsNeverResetEvenWithoutBootstrapPassword() {
        var existing = new AppUser(UUID.randomUUID(), "Existing", "admin@example.invalid",
                passwords.encode(password), Role.OWNER_ADMIN, true);
        when(users.findByEmail(existing.getEmail())).thenReturn(Optional.of(existing));
        bootstrap(existing.getEmail(), "").run(new DefaultApplicationArguments());
        verify(users, never()).insertInitialAdmin(any(), anyString(), anyString(), anyString());
        verify(users, never()).save(any());
        assertThat(passwords.matches(password, existing.getPasswordHash())).isTrue();
    }

    @Test
    void bootstrapRejectsProductionAndMissingDevProfile() {
        for (String[] profiles : new String[][] {{"prod"}, {"dev", "prod"}, {"default"}}) {
            environment.setActiveProfiles(profiles);
            assertThatThrownBy(() -> bootstrap("admin@example.invalid", password).run(new DefaultApplicationArguments()))
                    .isInstanceOf(IllegalStateException.class);
        }
        verifyNoInteractions(users);
    }

    @Test
    void invalidIdentityOrShortNewAccountPasswordCannotCreateAdmin() {
        assertThatThrownBy(() -> bootstrap("invalid", password).run(new DefaultApplicationArguments()))
                .isInstanceOf(IllegalStateException.class);
        when(users.findByEmail("admin@example.invalid")).thenReturn(Optional.empty());
        assertThatThrownBy(() -> bootstrap("admin@example.invalid", "short").run(new DefaultApplicationArguments()))
                .isInstanceOf(IllegalStateException.class);
        verify(users, never()).insertInitialAdmin(any(), anyString(), anyString(), anyString());
    }

    @Test
    void existingInactiveOrStaffAccountCannotBePromotedByBootstrap() {
        for (var existing : new AppUser[] {
                new AppUser(UUID.randomUUID(), "Staff", "admin@example.invalid", passwords.encode(password), Role.MANAGER, true),
                new AppUser(UUID.randomUUID(), "Inactive", "admin@example.invalid", passwords.encode(password), Role.OWNER_ADMIN, false)}) {
            when(users.findByEmail(existing.getEmail())).thenReturn(Optional.of(existing));
            assertThatThrownBy(() -> bootstrap(existing.getEmail(), password).run(new DefaultApplicationArguments()))
                    .isInstanceOf(IllegalStateException.class);
        }
        verify(users, never()).insertInitialAdmin(any(), anyString(), anyString(), anyString());
        verify(users, never()).save(any());
    }
}
