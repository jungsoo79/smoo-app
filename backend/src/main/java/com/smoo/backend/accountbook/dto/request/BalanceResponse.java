package com.smoo.backend.accountbook.dto.response;

public class BalanceResponse {

    private Long initialBalance;
    private Long totalIncome;
    private Long totalExpense;
    private Long currentBalance;
    private Long todayExpense;
    private Long yesterdayExpense;
    private Long differenceFromYesterday;

    public BalanceResponse(
            Long initialBalance,
            Long totalIncome,
            Long totalExpense,
            Long currentBalance,
            Long todayExpense,
            Long yesterdayExpense,
            Long differenceFromYesterday
    ) {
        this.initialBalance = initialBalance;
        this.totalIncome = totalIncome;
        this.totalExpense = totalExpense;
        this.currentBalance = currentBalance;
        this.todayExpense = todayExpense;
        this.yesterdayExpense = yesterdayExpense;
        this.differenceFromYesterday = differenceFromYesterday;
    }

    public Long getInitialBalance() {
        return initialBalance;
    }

    public Long getTotalIncome() {
        return totalIncome;
    }

    public Long getTotalExpense() {
        return totalExpense;
    }

    public Long getCurrentBalance() {
        return currentBalance;
    }

    public Long getTodayExpense() {
        return todayExpense;
    }

    public Long getYesterdayExpense() {
        return yesterdayExpense;
    }

    public Long getDifferenceFromYesterday() {
        return differenceFromYesterday;
    }
}