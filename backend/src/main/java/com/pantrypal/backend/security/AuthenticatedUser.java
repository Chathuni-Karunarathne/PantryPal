package com.pantrypal.backend.security;

import com.pantrypal.backend.auth.dto.UserResponse;
import java.util.UUID;

public record AuthenticatedUser(UserResponse user, UUID sessionId) {}
