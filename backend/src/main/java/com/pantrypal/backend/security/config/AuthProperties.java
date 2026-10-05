package com.pantrypal.backend.security.config;

import java.time.Duration;
import java.util.List;
import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties("pantrypal.auth")
public record AuthProperties(String jwtSecret, String issuer, String audience,
                             Duration accessTokenTtl, Duration refreshTokenTtl,
                             List<String> allowedOrigins) {
    public AuthProperties {
        if (issuer == null || issuer.isBlank() || audience == null || audience.isBlank()) {
            throw new IllegalArgumentException("JWT issuer and audience are required");
        }
        if (accessTokenTtl == null || accessTokenTtl.compareTo(Duration.ofSeconds(1)) < 0
                || accessTokenTtl.compareTo(Duration.ofHours(1)) > 0
                || refreshTokenTtl == null || refreshTokenTtl.compareTo(accessTokenTtl) <= 0
                || refreshTokenTtl.compareTo(Duration.ofDays(30)) > 0) {
            throw new IllegalArgumentException("Access TTL must be 1s..1h; refresh TTL must be longer and at most 30d");
        }
        if (allowedOrigins == null || allowedOrigins.isEmpty() || allowedOrigins.contains("*")) {
            throw new IllegalArgumentException("Configure explicit allowed origins");
        }
    }
    @Override public String toString() { return "AuthProperties[secret redacted]"; }
}
