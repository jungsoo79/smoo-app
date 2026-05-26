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
@Table(name = "ledger_categories")
public class LedgerCategory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 카테고리를 소유한 사용자 ID
    @Column(name = "user_id", nullable = false)
    private UUID userId;

    // 카테고리 이름: 식비, 교통, 쇼핑 등
    @Column(name = "name", nullable = false)
    private String name;

    // 카테고리 색상
    @Column(name = "color", nullable = false)
    private String color;

    // 수입용 카테고리인지, 지출용 카테고리인지
    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false)
    private TransactionType type;

    // 기본 카테고리 여부
    @Column(name = "is_default", nullable = false)
    private Boolean isDefault;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    private LedgerCategory(UUID userId, String name, String color, TransactionType type, Boolean isDefault) {
        this.userId = userId;
        this.name = name;
        this.color = color;
        this.type = type;
        this.isDefault = isDefault;
    }

    public static LedgerCategory create(UUID userId, String name, String color, TransactionType type, Boolean isDefault) {
        return new LedgerCategory(userId, name, color, type, isDefault);
    }

    public void update(String name, String color, TransactionType type) {
        this.name = name;
        this.color = color;
        this.type = type;
    }
}