package com.smoo.backend.deletion;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.Optional;
import java.util.UUID;

public interface AccountDeletionRequestRepository extends JpaRepository<AccountDeletionRequest, Long> {

    @Query(value = "SELECT * FROM account_deletion_requests WHERE user_id = :userId AND status IN ('pending', 'processing') LIMIT 1", nativeQuery = true)
    Optional<AccountDeletionRequest> findPendingByUserId(@Param("userId") UUID userId);
}