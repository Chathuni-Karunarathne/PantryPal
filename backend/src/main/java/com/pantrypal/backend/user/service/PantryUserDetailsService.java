package com.pantrypal.backend.user.service;

import com.pantrypal.backend.user.entity.AppUser;
import com.pantrypal.backend.user.repository.UserRepository;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PantryUserDetailsService implements UserDetailsService {
    private final UserRepository users;
    public PantryUserDetailsService(UserRepository users) { this.users = users; }

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String email) {
        var user = users.findByEmail(AppUser.normalizeEmail(email))
                .orElseThrow(() -> new UsernameNotFoundException("Invalid credentials"));
        return User.withUsername(user.getEmail()).password(user.getPasswordHash())
                .roles(user.getRole().name()).disabled(!user.isEnabled()).build();
    }
}
