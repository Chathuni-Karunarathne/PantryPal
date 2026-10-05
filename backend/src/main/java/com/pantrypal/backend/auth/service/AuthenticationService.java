package com.pantrypal.backend.auth.service;

import com.pantrypal.backend.auth.dto.*;
import com.pantrypal.backend.auth.entity.AuthSession;
import com.pantrypal.backend.auth.repository.AuthSessionRepository;
import com.pantrypal.backend.common.exception.InvalidRefreshTokenException;
import com.pantrypal.backend.security.AuthenticatedUser;
import com.pantrypal.backend.security.config.AuthProperties;
import com.pantrypal.backend.security.jwt.TokenService;
import com.pantrypal.backend.user.entity.AppUser;
import com.pantrypal.backend.user.repository.UserRepository;
import java.time.Clock;
import org.springframework.security.authentication.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthenticationService {
    private final AuthenticationManager authenticationManager;
    private final UserRepository users;
    private final AuthSessionRepository sessions;
    private final TokenService tokens;
    private final AuthProperties properties;
    private final Clock clock;

    public AuthenticationService(AuthenticationManager authenticationManager, UserRepository users,
                                 AuthSessionRepository sessions, TokenService tokens,
                                 AuthProperties properties, Clock clock) {
        this.authenticationManager = authenticationManager;
        this.users = users;
        this.sessions = sessions;
        this.tokens = tokens;
        this.properties = properties;
        this.clock = clock;
    }

    @Transactional
    public LoginResponse login(LoginRequest request) {
        String email = AppUser.normalizeEmail(request.email());
        authenticationManager.authenticate(UsernamePasswordAuthenticationToken.unauthenticated(email, request.password()));
        var user = users.findByEmail(email).orElseThrow(() -> new BadCredentialsException("Invalid credentials"));
        if (!user.isEnabled()) throw new DisabledException("Account disabled");
        String refresh = tokens.newRefreshToken();
        var session = new AuthSession(user, tokens.hashRefreshToken(refresh), clock.instant(),
                clock.instant().plus(properties.refreshTokenTtl()));
        sessions.save(session);
        return response(session, refresh);
    }

    @Transactional
    public LoginResponse refresh(RefreshTokenRequest request) {
        String hash = tokens.hashRefreshToken(request.refreshToken());
        var session = sessions.lockByRefreshTokenHash(hash).orElseThrow(InvalidRefreshTokenException::new);
        // Lock serializes refresh and logout; a consumed refresh token cannot be used twice.
        if (!session.isActive(clock.instant()) || !session.getUser().isEnabled()
                || !hash.equals(session.getRefreshTokenHash())) throw new InvalidRefreshTokenException();
        String refresh = tokens.newRefreshToken();
        session.rotate(tokens.hashRefreshToken(refresh));
        return response(session, refresh);
    }

    @Transactional
    public void logout(AuthenticatedUser principal) {
        sessions.lockById(principal.sessionId()).ifPresent(session -> {
            if (session.getUser().getId().equals(principal.user().id())) session.revoke(clock.instant());
        });
    }

    private LoginResponse response(AuthSession session, String refresh) {
        var access = tokens.accessToken(session);
        return new LoginResponse(access.getTokenValue(), "Bearer", access.getExpiresAt(), refresh,
                session.getExpiresAt(), UserResponse.from(session.getUser()));
    }
}
