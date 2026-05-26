package com.smoo.backend.deletion;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;
import java.time.OffsetDateTime;
import java.util.Optional;
import java.util.UUID;

public interface AccountDeletionRequestRepository extends JpaRepository<AccountDeletionRequest, Long> {

    @Query(value = "SELECT * FROM account_deletion_requests WHERE user_id = :userId AND status IN ('pending', 'processing') LIMIT 1", nativeQuery = true)
    Optional<AccountDeletionRequest> findPendingByUserId(@Param("userId") UUID userId);

    @Query(value = "SELECT * FROM account_deletion_requests WHERE id = :id AND user_id = :userId LIMIT 1", nativeQuery = true)
    Optional<AccountDeletionRequest> findByIdAndUserId(@Param("id") Long id, @Param("userId") UUID userId);

    @Modifying
    @Transactional
    @Query(value = "INSERT INTO account_deletion_requests (user_id, status, reason, requested_at, scheduled_delete_at) VALUES (:userId, 'pending'::request_status, :reason, :requestedAt, :scheduledDeleteAt)", nativeQuery = true)
    void insertDeletionRequest(
        @Param("userId") UUID userId,
        @Param("reason") String reason,
        @Param("requestedAt") OffsetDateTime requestedAt,
        @Param("scheduledDeleteAt") OffsetDateTime scheduledDeleteAt
    );
}