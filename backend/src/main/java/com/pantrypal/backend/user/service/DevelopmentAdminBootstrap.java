package com.pantrypal.backend.user.service;

import com.pantrypal.backend.user.entity.AppUser;
import com.pantrypal.backend.user.entity.Role;
import com.pantrypal.backend.user.repository.UserRepository;
import jakarta.validation.Validator;
import jakarta.validation.constraints.*;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.env.Environment;
import org.springframework.core.env.Profiles;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@ConditionalOnProperty(name = "pantrypal.bootstrap.enabled", havingValue = "true")
public class DevelopmentAdminBootstrap implements ApplicationRunner {
    private static final Logger log = LoggerFactory.getLogger(DevelopmentAdminBootstrap.class);
    private final UserRepository users;
    private final PasswordEncoder encoder;
    private final Validator validator;
    private final Environment environment;
    private final String email;
    private final String password;
    private final String name;

    public DevelopmentAdminBootstrap(UserRepository users, PasswordEncoder encoder, Validator validator,
            Environment environment, @Value("${pantrypal.bootstrap.email:}") String email,
            @Value("${pantrypal.bootstrap.password:}") String password,
            @Value("${pantrypal.bootstrap.name:PantryPal Administrator}") String name) {
        this.users = users;
        this.encoder = encoder;
        this.validator = validator;
        this.environment = environment;
        this.email = AppUser.normalizeEmail(email);
        this.password = password;
        this.name = name.strip();
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (!environment.acceptsProfiles(Profiles.of("dev & !prod"))) {
            throw new IllegalStateException("Development admin bootstrap requires the dev profile and must not run in prod");
        }
        if (!validator.validate(new Identity(email, name)).isEmpty()) {
            throw new IllegalStateException("Bootstrap requires a valid PANTRYPAL_ADMIN_EMAIL and PANTRYPAL_ADMIN_NAME");
        }
        var existing = users.findByEmail(email);
        if (existing.isPresent()) {
            requireAdmin(existing.get());
            log.info("Development administrator already exists; credentials were not changed");
            return;
        }
        if (password.isBlank() || password.length() < 12 || password.length() > 128) {
            throw new IllegalStateException("Set PANTRYPAL_ADMIN_PASSWORD to 12..128 characters to create the initial administrator");
        }
        int inserted = users.insertInitialAdmin(UUID.randomUUID(), name, email, encoder.encode(password));
        if (inserted == 0) requireAdmin(users.findByEmail(email).orElseThrow());
        log.info("Development administrator bootstrap completed; existing credentials were preserved");
    }

    private void requireAdmin(AppUser user) {
        if (user.getRole() != Role.OWNER_ADMIN || !user.isEnabled()) {
            throw new IllegalStateException("Bootstrap email belongs to an inactive or non-administrator account; no changes made");
        }
    }

    private record Identity(@NotBlank @Email @Size(max = 254) String email,
                            @NotBlank @Size(max = 120) String name) {}
}
