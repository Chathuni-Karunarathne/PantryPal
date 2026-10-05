package com.pantrypal.backend.security.jwt;

import com.nimbusds.jose.jwk.source.ImmutableSecret;
import com.pantrypal.backend.security.config.AuthProperties;
import java.time.Clock;
import java.time.Duration;
import java.util.Base64;
import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.oauth2.core.*;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.*;

@Configuration
@EnableConfigurationProperties(AuthProperties.class)
public class JwtConfiguration {
    @Bean
    public Clock authClock() { return Clock.systemUTC(); }

    @Bean
    SecretKey jwtKey(AuthProperties properties) {
        byte[] key;
        try {
            key = Base64.getDecoder().decode(properties.jwtSecret() == null ? "" : properties.jwtSecret());
        } catch (IllegalArgumentException exception) {
            throw new IllegalStateException("JWT_SECRET must be Base64-encoded random bytes");
        }
        if (key.length < 32) throw new IllegalStateException("JWT_SECRET must contain at least 32 random bytes, Base64-encoded");
        return new SecretKeySpec(key, "HmacSHA256");
    }

    @Bean
    JwtEncoder jwtEncoder(SecretKey key) { return new NimbusJwtEncoder(new ImmutableSecret<>(key)); }

    @Bean
    JwtDecoder jwtDecoder(SecretKey key, AuthProperties properties, Clock clock) {
        NimbusJwtDecoder decoder = NimbusJwtDecoder.withSecretKey(key).macAlgorithm(MacAlgorithm.HS256).build();
        JwtTimestampValidator timestamps = new JwtTimestampValidator(Duration.ZERO);
        timestamps.setClock(clock);
        OAuth2TokenValidator<Jwt> requiredClaims = jwt -> {
            boolean valid = jwt.getExpiresAt() != null && jwt.getIssuedAt() != null
                    && !jwt.getIssuedAt().isAfter(clock.instant())
                    && jwt.getAudience().contains(properties.audience())
                    && "access".equals(jwt.getClaimAsString("token_type"))
                    && jwt.getSubject() != null && jwt.getClaimAsString("sid") != null;
            return valid ? OAuth2TokenValidatorResult.success() : OAuth2TokenValidatorResult.failure(
                    new OAuth2Error("invalid_token", "Invalid access token", null));
        };
        decoder.setJwtValidator(new DelegatingOAuth2TokenValidator<>(timestamps,
                new JwtIssuerValidator(properties.issuer()), requiredClaims));
        return decoder;
    }
}
