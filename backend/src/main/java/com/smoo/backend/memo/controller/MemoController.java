package com.smoo.backend.memo.controller;

import com.smoo.backend.common.response.ApiResponse;
import com.smoo.backend.common.response.SuccessCode;
import com.smoo.backend.memo.dto.request.*;
import com.smoo.backend.memo.dto.response.*;
import com.smoo.backend.memo.service.MemoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/memos")
public class MemoController {

    private final MemoService memoService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<MemoSummaryResponse>>> getMemos(
            @RequestHeader("X-USER-ID") UUID userId,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Long categoryId
    ) {
        List<MemoSummaryResponse> response = memoService.getMemos(userId, keyword, categoryId);

        return ResponseEntity
                .status(SuccessCode.COMMON_SUCCESS.getHttpStatus())
                .body(ApiResponse.success(SuccessCode.COMMON_SUCCESS, response));
    }

    @GetMapping("/{memoId}")
    public ResponseEntity<ApiResponse<MemoDetailResponse>> getMemo(
            @RequestHeader("X-USER-ID") UUID userId,
            @PathVariable Long memoId
    ) {
        MemoDetailResponse response = memoService.getMemo(userId, memoId);

        return ResponseEntity
                .status(SuccessCode.COMMON_SUCCESS.getHttpStatus())
                .body(ApiResponse.success(SuccessCode.COMMON_SUCCESS, response));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<MemoDetailResponse>> createMemo(
            @RequestHeader("X-USER-ID") UUID userId,
            @Valid @RequestBody MemoCreateRequest request
    ) {
        MemoDetailResponse response = memoService.createMemo(userId, request);

        return ResponseEntity
                .status(SuccessCode.CREATED.getHttpStatus())
                .body(ApiResponse.success(SuccessCode.CREATED, response));
    }

    @PatchMapping("/{memoId}")
    public ResponseEntity<ApiResponse<MemoDetailResponse>> updateMemo(
            @RequestHeader("X-USER-ID") UUID userId,
            @PathVariable Long memoId,
            @Valid @RequestBody MemoUpdateRequest request
    ) {
        MemoDetailResponse response = memoService.updateMemo(userId, memoId, request);

        return ResponseEntity
                .status(SuccessCode.UPDATED.getHttpStatus())
                .body(ApiResponse.success(SuccessCode.UPDATED, response));
    }

    @DeleteMapping("/{memoId}")
    public ResponseEntity<ApiResponse<Void>> deleteMemo(
            @RequestHeader("X-USER-ID") UUID userId,
            @PathVariable Long memoId
    ) {
        memoService.deleteMemo(userId, memoId);

        return ResponseEntity
                .status(SuccessCode.DELETED.getHttpStatus())
                .body(ApiResponse.success(SuccessCode.DELETED));
    }

    @GetMapping("/categories")
    public ResponseEntity<ApiResponse<List<MemoCategoryResponse>>> getCategories(
            @RequestHeader("X-USER-ID") UUID userId
    ) {
        List<MemoCategoryResponse> response = memoService.getCategories(userId);

        return ResponseEntity
                .status(SuccessCode.COMMON_SUCCESS.getHttpStatus())
                .body(ApiResponse.success(SuccessCode.COMMON_SUCCESS, response));
    }

    @PostMapping("/categories")
    public ResponseEntity<ApiResponse<MemoCategoryResponse>> createCategory(
            @RequestHeader("X-USER-ID") UUID userId,
            @Valid @RequestBody MemoCategoryCreateRequest request
    ) {
        MemoCategoryResponse response = memoService.createCategory(userId, request);

        return ResponseEntity
                .status(SuccessCode.CREATED.getHttpStatus())
                .body(ApiResponse.success(SuccessCode.CREATED, response));
    }

    @PatchMapping("/categories/{categoryId}")
    public ResponseEntity<ApiResponse<MemoCategoryResponse>> updateCategory(
            @RequestHeader("X-USER-ID") UUID userId,
            @PathVariable Long categoryId,
            @Valid @RequestBody MemoCategoryUpdateRequest request
    ) {
        MemoCategoryResponse response = memoService.updateCategory(userId, categoryId, request);

        return ResponseEntity
                .status(SuccessCode.UPDATED.getHttpStatus())
                .body(ApiResponse.success(SuccessCode.UPDATED, response));
    }

    @DeleteMapping("/categories/{categoryId}")
    public ResponseEntity<ApiResponse<Void>> deleteCategory(
            @RequestHeader("X-USER-ID") UUID userId,
            @PathVariable Long categoryId
    ) {
        memoService.deleteCategory(userId, categoryId);

        return ResponseEntity
                .status(SuccessCode.DELETED.getHttpStatus())
                .body(ApiResponse.success(SuccessCode.DELETED));
    }

    @PostMapping("/{memoId}/attachments")
    public ResponseEntity<ApiResponse<MemoAttachmentResponse>> addAttachment(
            @RequestHeader("X-USER-ID") UUID userId,
            @PathVariable Long memoId,
            @Valid @RequestBody MemoAttachmentCreateRequest request
    ) {
        MemoAttachmentResponse response = memoService.addAttachment(userId, memoId, request);

        return ResponseEntity
                .status(SuccessCode.CREATED.getHttpStatus())
                .body(ApiResponse.success(SuccessCode.CREATED, response));
    }

    @DeleteMapping("/{memoId}/attachments/{attachmentId}")
    public ResponseEntity<ApiResponse<Void>> deleteAttachment(
            @RequestHeader("X-USER-ID") UUID userId,
            @PathVariable Long memoId,
            @PathVariable Long attachmentId
    ) {
        memoService.deleteAttachment(userId, memoId, attachmentId);

        return ResponseEntity
                .status(SuccessCode.DELETED.getHttpStatus())
                .body(ApiResponse.success(SuccessCode.DELETED));
    }
}