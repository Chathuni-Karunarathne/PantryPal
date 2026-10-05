package com.pantrypal.backend.auth.dto;

import java.time.Instant;

public record LoginResponse(String accessToken, String tokenType, Instant expiresAt,
                            String refreshToken, Instant refreshExpiresAt, UserResponse user) {
    @Override public String toString() { return "LoginResponse[tokens redacted]"; }
}
