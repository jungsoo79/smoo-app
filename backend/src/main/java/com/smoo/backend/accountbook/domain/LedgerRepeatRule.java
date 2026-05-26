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
@Table(name = "ledger_repeat_rules")
public class LedgerRepeatRule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 반복 규칙을 소유한 사용자 ID
    @Column(name = "user_id", nullable = false)
    private UUID userId;

    // 화면에 표시될 이름: 없음, 매일, 매주, 매월 등
    @Column(name = "name", nullable = false)
    private String name;

    // 실제 반복 주기
    @Enumerated(EnumType.STRING)
    @Column(name = "cycle", nullable = false)
    private RepeatCycle cycle;

    // 기본 반복 규칙 여부
    @Column(name = "is_default", nullable = false)
    private Boolean isDefault;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    private LedgerRepeatRule(UUID userId, String name, RepeatCycle cycle, Boolean isDefault) {
        this.userId = userId;
        this.name = name;
        this.cycle = cycle;
        this.isDefault = isDefault;
    }

    public static LedgerRepeatRule create(UUID userId, String name, RepeatCycle cycle, Boolean isDefault) {
        return new LedgerRepeatRule(userId, name, cycle, isDefault);
    }

    public void update(String name, RepeatCycle cycle) {
        this.name = name;
        this.cycle = cycle;
    }
}