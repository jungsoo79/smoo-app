package com.smoo.backend.accountbook.service;

import com.smoo.backend.accountbook.domain.*;
import com.smoo.backend.accountbook.dto.request.InitialBalanceRequest;
import com.smoo.backend.accountbook.dto.request.TransactionCreateRequest;
import com.smoo.backend.accountbook.dto.request.TransactionUpdateRequest;
import com.smoo.backend.accountbook.dto.response.BalanceResponse;
import com.smoo.backend.accountbook.dto.response.DailyTransactionResponse;
import com.smoo.backend.accountbook.dto.response.MonthlyTransactionResponse;
import com.smoo.backend.accountbook.dto.response.TransactionResponse;
import com.smoo.backend.accountbook.repository.LedgerBookRepository;
import com.smoo.backend.accountbook.repository.LedgerCategoryRepository;
import com.smoo.backend.accountbook.repository.LedgerPaymentMethodRepository;
import com.smoo.backend.accountbook.repository.LedgerRepeatRuleRepository;
import com.smoo.backend.accountbook.repository.LedgerTransactionRepository;
import com.smoo.backend.common.exception.CustomException;
import com.smoo.backend.common.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AccountBookService {

    private final LedgerBookRepository ledgerBookRepository;
    private final LedgerTransactionRepository ledgerTransactionRepository;
    private final LedgerCategoryRepository ledgerCategoryRepository;
    private final LedgerPaymentMethodRepository ledgerPaymentMethodRepository;
    private final LedgerRepeatRuleRepository ledgerRepeatRuleRepository;

    @Transactional
    public BalanceResponse setInitialBalance(UUID userId, InitialBalanceRequest request) {
        LedgerBook ledgerBook = ledgerBookRepository.findByUserId(userId)
                .orElseGet(() -> LedgerBook.create(userId, request.getAmount()));

        ledgerBook.updateInitialBalance(request.getAmount());

        LedgerBook savedLedgerBook = ledgerBookRepository.save(ledgerBook);

        return getBalance(userId);
    }

    @Transactional
    public TransactionResponse createTransaction(UUID userId, TransactionCreateRequest request) {
        validateReferences(
                userId,
                request.getCategoryId(),
                request.getPaymentMethodId(),
                request.getRepeatRuleId()
        );

        LedgerTransaction transaction = LedgerTransaction.create(
                userId,
                request.getType(),
                request.getAmount(),
                request.getTransactionDate(),
                request.getCategoryId(),
                request.getPaymentMethodId(),
                request.getRepeatRuleId(),
                request.getMemo()
        );

        LedgerTransaction savedTransaction = ledgerTransactionRepository.save(transaction);

        return toTransactionResponse(savedTransaction);
    }

    public DailyTransactionResponse getDailyTransactions(UUID userId, LocalDate date) {
        List<TransactionResponse> transactions = ledgerTransactionRepository
                .findByUserIdAndTransactionDateOrderByCreatedAtDesc(userId, date)
                .stream()
                .map(this::toTransactionResponse)
                .toList();

        return new DailyTransactionResponse(date, transactions);
    }

    public MonthlyTransactionResponse getMonthlyTransactions(UUID userId, int year, int month) {
        YearMonth yearMonth = YearMonth.of(year, month);

        LocalDate startDate = yearMonth.atDay(1);
        LocalDate endDate = yearMonth.atEndOfMonth();

        List<TransactionResponse> transactions = ledgerTransactionRepository
                .findByUserIdAndTransactionDateBetweenOrderByTransactionDateDescCreatedAtDesc(
                        userId,
                        startDate,
                        endDate
                )
                .stream()
                .map(this::toTransactionResponse)
                .toList();

        return new MonthlyTransactionResponse(year, month, transactions);
    }

    public BalanceResponse getBalance(UUID userId) {
        Long initialBalance = ledgerBookRepository.findByUserId(userId)
                .map(LedgerBook::getInitialBalance)
                .orElse(0L);

        List<LedgerTransaction> allTransactions = ledgerTransactionRepository.findByUserId(userId);

        Long totalIncome = sumByType(allTransactions, TransactionType.INCOME);
        Long totalExpense = sumByType(allTransactions, TransactionType.EXPENSE);

        Long currentBalance = initialBalance + totalIncome - totalExpense;

        LocalDate today = LocalDate.now();
        LocalDate yesterday = today.minusDays(1);

        Long todayExpense = sumExpenseByDate(userId, today);
        Long yesterdayExpense = sumExpenseByDate(userId, yesterday);

        Long differenceFromYesterday = todayExpense - yesterdayExpense;

        return new BalanceResponse(
                initialBalance,
                totalIncome,
                totalExpense,
                currentBalance,
                todayExpense,
                yesterdayExpense,
                differenceFromYesterday
        );
    }

    @Transactional
    public TransactionResponse updateTransaction(UUID userId, Long transactionId, TransactionUpdateRequest request) {
        LedgerTransaction transaction = ledgerTransactionRepository.findByIdAndUserId(transactionId, userId)
                .orElseThrow(() -> new CustomException(ErrorCode.RESOURCE_NOT_FOUND, "거래 내역을 찾을 수 없습니다."));

        validateReferences(
                userId,
                request.getCategoryId(),
                request.getPaymentMethodId(),
                request.getRepeatRuleId()
        );

        transaction.update(
                request.getType(),
                request.getAmount(),
                request.getTransactionDate(),
                request.getCategoryId(),
                request.getPaymentMethodId(),
                request.getRepeatRuleId(),
                request.getMemo()
        );

        return toTransactionResponse(transaction);
    }

    @Transactional
    public void deleteTransaction(UUID userId, Long transactionId) {
        LedgerTransaction transaction = ledgerTransactionRepository.findByIdAndUserId(transactionId, userId)
                .orElseThrow(() -> new CustomException(ErrorCode.RESOURCE_NOT_FOUND, "거래 내역을 찾을 수 없습니다."));

        ledgerTransactionRepository.delete(transaction);
    }

    private void validateReferences(UUID userId, Long categoryId, Long paymentMethodId, Long repeatRuleId) {
        if (categoryId != null) {
            ledgerCategoryRepository.findByIdAndUserId(categoryId, userId)
                    .orElseThrow(() -> new CustomException(ErrorCode.RESOURCE_NOT_FOUND, "카테고리를 찾을 수 없습니다."));
        }

        if (paymentMethodId != null) {
            ledgerPaymentMethodRepository.findByIdAndUserId(paymentMethodId, userId)
                    .orElseThrow(() -> new CustomException(ErrorCode.RESOURCE_NOT_FOUND, "결제수단을 찾을 수 없습니다."));
        }

        if (repeatRuleId != null) {
            ledgerRepeatRuleRepository.findByIdAndUserId(repeatRuleId, userId)
                    .orElseThrow(() -> new CustomException(ErrorCode.RESOURCE_NOT_FOUND, "반복 규칙을 찾을 수 없습니다."));
        }
    }

    private TransactionResponse toTransactionResponse(LedgerTransaction transaction) {
        Long categoryId = transaction.getCategoryId();
        Long paymentMethodId = transaction.getPaymentMethodId();
        Long repeatRuleId = transaction.getRepeatRuleId();

        String categoryName = null;
        String categoryColor = null;
        String paymentMethodName = null;
        String repeatRuleName = null;

        if (categoryId != null) {
            LedgerCategory category = ledgerCategoryRepository.findByIdAndUserId(categoryId, transaction.getUserId())
                    .orElse(null);

            if (category != null) {
                categoryName = category.getName();
                categoryColor = category.getColor();
            }
        }

        if (paymentMethodId != null) {
            LedgerPaymentMethod paymentMethod = ledgerPaymentMethodRepository
                    .findByIdAndUserId(paymentMethodId, transaction.getUserId())
                    .orElse(null);

            if (paymentMethod != null) {
                paymentMethodName = paymentMethod.getName();
            }
        }

        if (repeatRuleId != null) {
            LedgerRepeatRule repeatRule = ledgerRepeatRuleRepository
                    .findByIdAndUserId(repeatRuleId, transaction.getUserId())
                    .orElse(null);

            if (repeatRule != null) {
                repeatRuleName = repeatRule.getName();
            }
        }

        return new TransactionResponse(
                transaction.getId(),
                transaction.getType(),
                transaction.getAmount(),
                transaction.getTransactionDate(),
                categoryId,
                categoryName,
                categoryColor,
                paymentMethodId,
                paymentMethodName,
                repeatRuleId,
                repeatRuleName,
                transaction.getMemo()
        );
    }

    private Long sumByType(List<LedgerTransaction> transactions, TransactionType type) {
        return transactions.stream()
                .filter(transaction -> transaction.getType() == type)
                .mapToLong(LedgerTransaction::getAmount)
                .sum();
    }

    private Long sumExpenseByDate(UUID userId, LocalDate date) {
        return ledgerTransactionRepository
                .findByUserIdAndTransactionDateOrderByCreatedAtDesc(userId, date)
                .stream()
                .filter(transaction -> transaction.getType() == TransactionType.EXPENSE)
                .mapToLong(LedgerTransaction::getAmount)
                .sum();
    }
}