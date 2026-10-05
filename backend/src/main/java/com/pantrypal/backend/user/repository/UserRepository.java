package com.pantrypal.backend.user.repository;

import com.pantrypal.backend.user.entity.AppUser;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface UserRepository extends JpaRepository<AppUser, UUID> {
    Optional<AppUser> findByEmail(String email);

    // Atomic even if two development instances bootstrap the same email together.
    @Modifying
    @Query(value = """
        INSERT INTO users (id, name, email, password_hash, role, enabled)
        VALUES (:id, :name, :email, :hash, 'OWNER_ADMIN', true)
        ON CONFLICT (email) DO NOTHING
        """, nativeQuery = true)
    int insertInitialAdmin(@Param("id") UUID id, @Param("name") String name,
                           @Param("email") String email, @Param("hash") String hash);
}
