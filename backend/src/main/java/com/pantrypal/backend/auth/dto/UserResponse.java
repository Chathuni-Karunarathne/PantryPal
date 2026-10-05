package com.pantrypal.backend.auth.dto;

import com.pantrypal.backend.user.entity.AppUser;
import com.pantrypal.backend.user.entity.Role;
import java.util.UUID;

public record UserResponse(UUID id, String name, String email, Role role, boolean enabled) {
    public static UserResponse from(AppUser user) {
        return new UserResponse(user.getId(), user.getName(), user.getEmail(), user.getRole(), user.isEnabled());
    }
}
