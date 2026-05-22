package com.smoo.backend.accountbook.dto.response;

import java.util.List;

public class MonthlyTransactionResponse {

    private int year;
    private int month;
    private List<TransactionResponse> transactions;

    public MonthlyTransactionResponse(int year, int month, List<TransactionResponse> transactions) {
        this.year = year;
        this.month = month;
        this.transactions = transactions;
    }

    public int getYear() {
        return year;
    }

    public int getMonth() {
        return month;
    }

    public List<TransactionResponse> getTransactions() {
        return transactions;
    }
}