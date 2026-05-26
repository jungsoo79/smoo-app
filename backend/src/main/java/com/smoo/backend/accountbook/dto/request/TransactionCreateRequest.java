package com.smoo.backend.accountbook.dto.request;

import com.smoo.backend.accountbook.domain.TransactionType;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public class TransactionCreateRequest {

    @NotNull(message = "거래 유형은 필수입니다.")
    private TransactionType type;

    @NotNull(message = "금액은 필수입니다.")
    @Min(value = 1, message = "금액은 1원 이상이어야 합니다.")
    private Long amount;

    @NotNull(message = "거래 날짜는 필수입니다.")
    private LocalDate transactionDate;

    private Long categoryId;

    private Long paymentMethodId;

    private Long repeatRuleId;

    private String memo;

    public TransactionType getType() {
        return type;
    }

    public Long getAmount() {
        return amount;
    }

    public LocalDate getTransactionDate() {
        return transactionDate;
    }

    public Long getCategoryId() {
        return categoryId;
    }

    public Long getPaymentMethodId() {
        return paymentMethodId;
    }

    public Long getRepeatRuleId() {
        return repeatRuleId;
    }

    public String getMemo() {
        return memo;
    }
}