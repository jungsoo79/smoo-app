package com.smoo.backend.accountbook.domain;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.OffsetDateTime;
import java.util.UUID;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Entity
@Table(name = "ledger_books")
public class LedgerBook {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // public.profiles(id)와 연결되는 사용자 ID
    @Column(name = "user_id", nullable = false, unique = true)
    private UUID userId;

    // 시작 금액
    @Column(name = "initial_balance", nullable = false)
    private Long initialBalance;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    private LedgerBook(UUID userId, Long initialBalance) {
        this.userId = userId;
        this.initialBalance = initialBalance;
    }

    public static LedgerBook create(UUID userId, Long initialBalance) {
        return new LedgerBook(userId, initialBalance);
    }

    public void updateInitialBalance(Long initialBalance) {
        this.initialBalance = initialBalance;
    }
}