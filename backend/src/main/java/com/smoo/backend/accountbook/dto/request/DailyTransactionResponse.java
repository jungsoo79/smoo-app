package com.smoo.backend.accountbook.dto.response;

import java.time.LocalDate;
import java.util.List;

public class DailyTransactionResponse {

    private LocalDate date;
    private List<TransactionResponse> transactions;

    public DailyTransactionResponse(LocalDate date, List<TransactionResponse> transactions) {
        this.date = date;
        this.transactions = transactions;
    }

    public LocalDate getDate() {
        return date;
    }

    public List<TransactionResponse> getTransactions() {
        return transactions;
    }
}