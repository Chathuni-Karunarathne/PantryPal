package com.pantrypal.backend.auth.repository;

import com.pantrypal.backend.auth.entity.AuthSession;
import jakarta.persistence.LockModeType;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

public interface AuthSessionRepository extends JpaRepository<AuthSession, UUID> {
    @EntityGraph(attributePaths = "user")
    @Query("select s from AuthSession s where s.id = :id")
    Optional<AuthSession> findWithUserById(@Param("id") UUID id);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select s from AuthSession s where s.refreshTokenHash = :hash")
    Optional<AuthSession> lockByRefreshTokenHash(@Param("hash") String hash);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select s from AuthSession s where s.id = :id")
    Optional<AuthSession> lockById(@Param("id") UUID id);
}
