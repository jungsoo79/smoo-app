package com.smoo.backend.accountbook.controller;

import com.smoo.backend.accountbook.dto.request.CategoryCreateRequest;
import com.smoo.backend.accountbook.dto.request.InitialBalanceRequest;
import com.smoo.backend.accountbook.dto.request.RepeatRuleCreateRequest;
import com.smoo.backend.accountbook.dto.request.TransactionCreateRequest;
import com.smoo.backend.accountbook.dto.request.TransactionUpdateRequest;
import com.smoo.backend.accountbook.dto.response.BalanceResponse;
import com.smoo.backend.accountbook.dto.response.CategoryResponse;
import com.smoo.backend.accountbook.dto.response.DailyTransactionResponse;
import com.smoo.backend.accountbook.dto.response.MonthlyTransactionResponse;
import com.smoo.backend.accountbook.dto.response.PaymentMethodResponse;
import com.smoo.backend.accountbook.dto.response.RepeatRuleResponse;
import com.smoo.backend.accountbook.dto.response.TransactionResponse;
import com.smoo.backend.accountbook.service.AccountBookService;
import com.smoo.backend.common.response.ApiResponse;
import com.smoo.backend.common.response.SuccessCode;
import com.smoo.backend.common.security.CurrentUserResolver;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/account-books")
public class AccountBookController {

    private final AccountBookService accountBookService;

    @PostMapping("/initial-balance")
    public ResponseEntity<ApiResponse<BalanceResponse>> setInitialBalance(
            Authentication authentication,
            @Valid @RequestBody InitialBalanceRequest request
    ) {
        UUID userId = CurrentUserResolver.resolve(authentication);
        BalanceResponse response = accountBookService.setInitialBalance(userId, request);

        return ResponseEntity
                .status(SuccessCode.CREATED.getHttpStatus())
                .body(ApiResponse.success(SuccessCode.CREATED, response));
    }

    @GetMapping("/balance")
    public ResponseEntity<ApiResponse<BalanceResponse>> getBalance(
            Authentication authentication
    ) {
        UUID userId = CurrentUserResolver.resolve(authentication);
        BalanceResponse response = accountBookService.getBalance(userId);

        return ResponseEntity
                .status(SuccessCode.COMMON_SUCCESS.getHttpStatus())
                .body(ApiResponse.success(SuccessCode.COMMON_SUCCESS, response));
    }

    @PostMapping("/transactions")
    public ResponseEntity<ApiResponse<TransactionResponse>> createTransaction(
            Authentication authentication,
            @Valid @RequestBody TransactionCreateRequest request
    ) {
        UUID userId = CurrentUserResolver.resolve(authentication);
        TransactionResponse response = accountBookService.createTransaction(userId, request);

        return ResponseEntity
                .status(SuccessCode.CREATED.getHttpStatus())
                .body(ApiResponse.success(SuccessCode.CREATED, response));
    }

    @GetMapping("/transactions")
    public ResponseEntity<ApiResponse<DailyTransactionResponse>> getDailyTransactions(
            Authentication authentication,
            @RequestParam("date") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date
    ) {
        UUID userId = CurrentUserResolver.resolve(authentication);
        DailyTransactionResponse response = accountBookService.getDailyTransactions(userId, date);

        return ResponseEntity
                .status(SuccessCode.COMMON_SUCCESS.getHttpStatus())
                .body(ApiResponse.success(SuccessCode.COMMON_SUCCESS, response));
    }

    @GetMapping("/transactions/monthly")
    public ResponseEntity<ApiResponse<MonthlyTransactionResponse>> getMonthlyTransactions(
            Authentication authentication,
            @RequestParam("year") int year,
            @RequestParam("month") int month
    ) {
        UUID userId = CurrentUserResolver.resolve(authentication);
        MonthlyTransactionResponse response = accountBookService.getMonthlyTransactions(userId, year, month);

        return ResponseEntity
                .status(SuccessCode.COMMON_SUCCESS.getHttpStatus())
                .body(ApiResponse.success(SuccessCode.COMMON_SUCCESS, response));
    }

    @PatchMapping("/transactions/{transactionId}")
    public ResponseEntity<ApiResponse<TransactionResponse>> updateTransaction(
            Authentication authentication,
            @PathVariable Long transactionId,
            @Valid @RequestBody TransactionUpdateRequest request
    ) {
        UUID userId = CurrentUserResolver.resolve(authentication);
        TransactionResponse response = accountBookService.updateTransaction(userId, transactionId, request);

        return ResponseEntity
                .status(SuccessCode.UPDATED.getHttpStatus())
                .body(ApiResponse.success(SuccessCode.UPDATED, response));
    }

    @DeleteMapping("/transactions/{transactionId}")
    public ResponseEntity<ApiResponse<Void>> deleteTransaction(
            Authentication authentication,
            @PathVariable Long transactionId
    ) {
        UUID userId = CurrentUserResolver.resolve(authentication);
        accountBookService.deleteTransaction(userId, transactionId);

        return ResponseEntity
                .status(SuccessCode.DELETED.getHttpStatus())
                .body(ApiResponse.success(SuccessCode.DELETED));
    }

    @GetMapping("/categories")
    public ResponseEntity<ApiResponse<List<CategoryResponse>>> getCategories(
            Authentication authentication
    ) {
        UUID userId = CurrentUserResolver.resolve(authentication);
        List<CategoryResponse> response = accountBookService.getCategories(userId);

        return ResponseEntity
                .status(SuccessCode.COMMON_SUCCESS.getHttpStatus())
                .body(ApiResponse.success(SuccessCode.COMMON_SUCCESS, response));
    }

    @PostMapping("/categories")
    public ResponseEntity<ApiResponse<CategoryResponse>> createCategory(
            Authentication authentication,
            @Valid @RequestBody CategoryCreateRequest request
    ) {
        UUID userId = CurrentUserResolver.resolve(authentication);
        CategoryResponse response = accountBookService.createCategory(userId, request);

        return ResponseEntity
                .status(SuccessCode.CREATED.getHttpStatus())
                .body(ApiResponse.success(SuccessCode.CREATED, response));
    }

    @GetMapping("/payment-methods")
    public ResponseEntity<ApiResponse<List<PaymentMethodResponse>>> getPaymentMethods(
            Authentication authentication
    ) {
        UUID userId = CurrentUserResolver.resolve(authentication);
        List<PaymentMethodResponse> response = accountBookService.getPaymentMethods(userId);

        return ResponseEntity
                .status(SuccessCode.COMMON_SUCCESS.getHttpStatus())
                .body(ApiResponse.success(SuccessCode.COMMON_SUCCESS, response));
    }

    @PostMapping("/repeat-rules")
    public ResponseEntity<ApiResponse<RepeatRuleResponse>> createRepeatRule(
            Authentication authentication,
            @Valid @RequestBody RepeatRuleCreateRequest request
    ) {
        UUID userId = CurrentUserResolver.resolve(authentication);
        RepeatRuleResponse response = accountBookService.createRepeatRule(userId, request);

        return ResponseEntity
                .status(SuccessCode.CREATED.getHttpStatus())
                .body(ApiResponse.success(SuccessCode.CREATED, response));
    }
}



