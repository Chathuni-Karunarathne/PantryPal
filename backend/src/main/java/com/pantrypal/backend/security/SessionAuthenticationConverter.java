package com.pantrypal.backend.security;

import com.pantrypal.backend.auth.dto.UserResponse;
import com.pantrypal.backend.auth.repository.AuthSessionRepository;
import java.time.Clock;
import java.util.List;
import java.util.UUID;
import org.springframework.core.convert.converter.Converter;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class SessionAuthenticationConverter implements Converter<Jwt, AbstractAuthenticationToken> {
    private final AuthSessionRepository sessions;
    private final Clock clock;

    public SessionAuthenticationConverter(AuthSessionRepository sessions, Clock clock) {
        this.sessions = sessions;
        this.clock = clock;
    }

    @Override
    @Transactional(readOnly = true)
    public AbstractAuthenticationToken convert(Jwt jwt) {
        UUID sessionId;
        UUID userId;
        try {
            sessionId = UUID.fromString(jwt.getClaimAsString("sid"));
            userId = UUID.fromString(jwt.getSubject());
        } catch (IllegalArgumentException | NullPointerException exception) {
            throw invalidToken();
        }
        var session = sessions.findWithUserById(sessionId).orElseThrow(this::invalidToken);
        var user = session.getUser();
        if (!session.isActive(clock.instant()) || !user.isEnabled() || !user.getId().equals(userId)) {
            throw invalidToken();
        }
        // Read the current role, not a potentially stale role claim in the JWT.
        return UsernamePasswordAuthenticationToken.authenticated(
                new AuthenticatedUser(UserResponse.from(user), sessionId), null,
                List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole().name())));
    }

    private OAuth2AuthenticationException invalidToken() { return new OAuth2AuthenticationException("invalid_token"); }
}
