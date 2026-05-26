package com.smoo.backend.accountbook.controller;

import com.smoo.backend.accountbook.dto.request.InitialBalanceRequest;
import com.smoo.backend.accountbook.dto.request.TransactionCreateRequest;
import com.smoo.backend.accountbook.dto.request.TransactionUpdateRequest;
import com.smoo.backend.accountbook.dto.response.BalanceResponse;
import com.smoo.backend.accountbook.dto.response.DailyTransactionResponse;
import com.smoo.backend.accountbook.dto.response.MonthlyTransactionResponse;
import com.smoo.backend.accountbook.dto.response.TransactionResponse;
import com.smoo.backend.accountbook.service.AccountBookService;
import com.smoo.backend.common.response.ApiResponse;
import com.smoo.backend.common.response.SuccessCode;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/account-books")
public class AccountBookController {

    private final AccountBookService accountBookService;

    @PostMapping("/initial-balance")
    public ResponseEntity<ApiResponse<BalanceResponse>> setInitialBalance(
            @RequestHeader("X-USER-ID") UUID userId,
            @Valid @RequestBody InitialBalanceRequest request
    ) {
        BalanceResponse response = accountBookService.setInitialBalance(userId, request);

        return ResponseEntity
                .status(SuccessCode.CREATED.getHttpStatus())
                .body(ApiResponse.success(SuccessCode.CREATED, response));
    }

    @GetMapping("/balance")
    public ResponseEntity<ApiResponse<BalanceResponse>> getBalance(
            @RequestHeader("X-USER-ID") UUID userId
    ) {
        BalanceResponse response = accountBookService.getBalance(userId);

        return ResponseEntity
                .status(SuccessCode.COMMON_SUCCESS.getHttpStatus())
                .body(ApiResponse.success(SuccessCode.COMMON_SUCCESS, response));
    }

    @PostMapping("/transactions")
    public ResponseEntity<ApiResponse<TransactionResponse>> createTransaction(
            @RequestHeader("X-USER-ID") UUID userId,
            @Valid @RequestBody TransactionCreateRequest request
    ) {
        TransactionResponse response = accountBookService.createTransaction(userId, request);

        return ResponseEntity
                .status(SuccessCode.CREATED.getHttpStatus())
                .body(ApiResponse.success(SuccessCode.CREATED, response));
    }

    @GetMapping("/transactions")
    public ResponseEntity<ApiResponse<DailyTransactionResponse>> getDailyTransactions(
            @RequestHeader("X-USER-ID") UUID userId,
            @RequestParam("date") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date
    ) {
        DailyTransactionResponse response = accountBookService.getDailyTransactions(userId, date);

        return ResponseEntity
                .status(SuccessCode.COMMON_SUCCESS.getHttpStatus())
                .body(ApiResponse.success(SuccessCode.COMMON_SUCCESS, response));
    }

    @GetMapping("/transactions/monthly")
    public ResponseEntity<ApiResponse<MonthlyTransactionResponse>> getMonthlyTransactions(
            @RequestHeader("X-USER-ID") UUID userId,
            @RequestParam("year") int year,
            @RequestParam("month") int month
    ) {
        MonthlyTransactionResponse response = accountBookService.getMonthlyTransactions(userId, year, month);

        return ResponseEntity
                .status(SuccessCode.COMMON_SUCCESS.getHttpStatus())
                .body(ApiResponse.success(SuccessCode.COMMON_SUCCESS, response));
    }

    @PatchMapping("/transactions/{transactionId}")
    public ResponseEntity<ApiResponse<TransactionResponse>> updateTransaction(
            @RequestHeader("X-USER-ID") UUID userId,
            @PathVariable Long transactionId,
            @Valid @RequestBody TransactionUpdateRequest request
    ) {
        TransactionResponse response = accountBookService.updateTransaction(userId, transactionId, request);

        return ResponseEntity
                .status(SuccessCode.UPDATED.getHttpStatus())
                .body(ApiResponse.success(SuccessCode.UPDATED, response));
    }

    @DeleteMapping("/transactions/{transactionId}")
    public ResponseEntity<ApiResponse<Void>> deleteTransaction(
            @RequestHeader("X-USER-ID") UUID userId,
            @PathVariable Long transactionId
    ) {
        accountBookService.deleteTransaction(userId, transactionId);

        return ResponseEntity
                .status(SuccessCode.DELETED.getHttpStatus())
                .body(ApiResponse.success(SuccessCode.DELETED));
    }
}