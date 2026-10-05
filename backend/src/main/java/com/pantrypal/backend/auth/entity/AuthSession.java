package com.pantrypal.backend.auth.entity;

import com.pantrypal.backend.user.entity.AppUser;
import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "auth_sessions")
public class AuthSession {
    @Id
    private UUID id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private AppUser user;
    @Column(name = "refresh_token_hash", nullable = false, unique = true, length = 64)
    private String refreshTokenHash;
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;
    @Column(name = "expires_at", nullable = false)
    private Instant expiresAt;
    @Column(name = "revoked_at")
    private Instant revokedAt;

    protected AuthSession() {}

    public AuthSession(AppUser user, String refreshTokenHash, Instant now, Instant expiresAt) {
        id = UUID.randomUUID();
        this.user = user;
        this.refreshTokenHash = refreshTokenHash;
        createdAt = now;
        this.expiresAt = expiresAt;
    }

    public boolean isActive(Instant now) { return revokedAt == null && expiresAt.isAfter(now); }
    public void rotate(String hash) { refreshTokenHash = hash; }
    public void revoke(Instant now) { if (revokedAt == null) revokedAt = now; }
    public UUID getId() { return id; }
    public AppUser getUser() { return user; }
    public String getRefreshTokenHash() { return refreshTokenHash; }
    public Instant getExpiresAt() { return expiresAt; }
}
