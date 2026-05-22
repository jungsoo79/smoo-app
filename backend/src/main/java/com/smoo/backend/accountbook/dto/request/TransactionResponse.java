package com.smoo.backend.accountbook.dto.response;

import com.smoo.backend.accountbook.domain.TransactionType;

import java.time.LocalDate;

public class TransactionResponse {

    private Long id;
    private TransactionType type;
    private Long amount;
    private LocalDate transactionDate;

    private Long categoryId;
    private String categoryName;
    private String categoryColor;

    private Long paymentMethodId;
    private String paymentMethodName;

    private Long repeatRuleId;
    private String repeatRuleName;

    private String memo;

    public TransactionResponse(
            Long id,
            TransactionType type,
            Long amount,
            LocalDate transactionDate,
            Long categoryId,
            String categoryName,
            String categoryColor,
            Long paymentMethodId,
            String paymentMethodName,
            Long repeatRuleId,
            String repeatRuleName,
            String memo
    ) {
        this.id = id;
        this.type = type;
        this.amount = amount;
        this.transactionDate = transactionDate;
        this.categoryId = categoryId;
        this.categoryName = categoryName;
        this.categoryColor = categoryColor;
        this.paymentMethodId = paymentMethodId;
        this.paymentMethodName = paymentMethodName;
        this.repeatRuleId = repeatRuleId;
        this.repeatRuleName = repeatRuleName;
        this.memo = memo;
    }

    public Long getId() {
        return id;
    }

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

    public String getCategoryName() {
        return categoryName;
    }

    public String getCategoryColor() {
        return categoryColor;
    }

    public Long getPaymentMethodId() {
        return paymentMethodId;
    }

    public String getPaymentMethodName() {
        return paymentMethodName;
    }

    public Long getRepeatRuleId() {
        return repeatRuleId;
    }

    public String getRepeatRuleName() {
        return repeatRuleName;
    }

    public String getMemo() {
        return memo;
    }
}