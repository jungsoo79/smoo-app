package com.smoo.backend.deletion;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.OffsetDateTime;
import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "account_deletion_requests")
public class AccountDeletionRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "status", nullable = false, columnDefinition = "request_status")
    private String status;

    @Column(name = "requested_at", nullable = false)
    private OffsetDateTime requestedAt;

    @Column(name = "scheduled_delete_at")
    private OffsetDateTime scheduledDeleteAt;

    @Column(name = "completed_at")
    private OffsetDateTime completedAt;

    @Column(name = "reason")
    private String reason;
}