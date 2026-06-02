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
@Table(name = "ledger_payment_methods")
public class LedgerPaymentMethod {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 결제수단을 소유한 사용자 ID
    @Column(name = "user_id", nullable = false)
    private UUID userId;

    // 카드, 현금, 계좌이체 등
    @Column(name = "name", nullable = false)
    private String name;

    // 기본 결제수단 여부
    @Column(name = "is_default", nullable = false)
    private Boolean isDefault;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    private LedgerPaymentMethod(UUID userId, String name, Boolean isDefault) {
        this.userId = userId;
        this.name = name;
        this.isDefault = isDefault;
    }

    public static LedgerPaymentMethod create(UUID userId, String name, Boolean isDefault) {
        return new LedgerPaymentMethod(userId, name, isDefault);
    }

    public void updateName(String name) {
        this.name = name;
    }
}