package com.smoo.backend.settings;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;

public interface UserPreferencesRepository extends JpaRepository<UserPreferences, Long> {

    Optional<UserPreferences> findByUserId(UUID userId);
}
