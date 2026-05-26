package com.smoo.backend.accountbook.domain;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Entity
@Table(name = "ledger_transactions")
public class LedgerTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 거래를 등록한 사용자 ID
    @Column(name = "user_id", nullable = false)
    private UUID userId;

    // INCOME 또는 EXPENSE
    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false)
    private TransactionType type;

    // 금액
    @Column(name = "amount", nullable = false)
    private Long amount;

    // 거래 날짜
    @Column(name = "transaction_date", nullable = false)
    private LocalDate transactionDate;

    // 카테고리 ID
    @Column(name = "category_id")
    private Long categoryId;

    // 결제수단 ID
    @Column(name = "payment_method_id")
    private Long paymentMethodId;

    // 반복 규칙 ID
    @Column(name = "repeat_rule_id")
    private Long repeatRuleId;

    // 메모 또는 거래명
    @Column(name = "memo")
    private String memo;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    private LedgerTransaction(
            UUID userId,
            TransactionType type,
            Long amount,
            LocalDate transactionDate,
            Long categoryId,
            Long paymentMethodId,
            Long repeatRuleId,
            String memo
    ) {
        this.userId = userId;
        this.type = type;
        this.amount = amount;
        this.transactionDate = transactionDate;
        this.categoryId = categoryId;
        this.paymentMethodId = paymentMethodId;
        this.repeatRuleId = repeatRuleId;
        this.memo = memo;
    }

    public static LedgerTransaction create(
            UUID userId,
            TransactionType type,
            Long amount,
            LocalDate transactionDate,
            Long categoryId,
            Long paymentMethodId,
            Long repeatRuleId,
            String memo
    ) {
        return new LedgerTransaction(
                userId,
                type,
                amount,
                transactionDate,
                categoryId,
                paymentMethodId,
                repeatRuleId,
                memo
        );
    }

    public void update(
            TransactionType type,
            Long amount,
            LocalDate transactionDate,
            Long categoryId,
            Long paymentMethodId,
            Long repeatRuleId,
            String memo
    ) {
        this.type = type;
        this.amount = amount;
        this.transactionDate = transactionDate;
        this.categoryId = categoryId;
        this.paymentMethodId = paymentMethodId;
        this.repeatRuleId = repeatRuleId;
        this.memo = memo;
    }
}