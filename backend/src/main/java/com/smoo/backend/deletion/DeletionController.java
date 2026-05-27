package com.smoo.backend.deletion;

import com.smoo.backend.common.response.ApiResponse;
import com.smoo.backend.common.response.SuccessCode;
import com.smoo.backend.deletion.dto.DeletionCreateRequest;
import com.smoo.backend.deletion.dto.DeletionStatusResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/account-deletion-requests")
@RequiredArgsConstructor
public class DeletionController {

    private final DeletionService deletionService;

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<DeletionStatusResponse>> getDeletionStatus(Authentication authentication) {
        UUID userId = UUID.fromString(authentication.getName());
        DeletionStatusResponse response = deletionService.getDeletionStatus(userId);
        return ResponseEntity.ok(ApiResponse.success(SuccessCode.COMMON_SUCCESS, response));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<DeletionStatusResponse>> createDeletionRequest(
            Authentication authentication,
            @RequestBody DeletionCreateRequest request) {
        UUID userId = UUID.fromString(authentication.getName());
        DeletionStatusResponse response = deletionService.createDeletionRequest(userId, request);
        return ResponseEntity.status(201).body(ApiResponse.success(SuccessCode.DELETION_REQUEST_SUCCESS, response));
    }

    @DeleteMapping("/{requestId}")
    public ResponseEntity<ApiResponse<Void>> cancelDeletionRequest(
            Authentication authentication,
            @PathVariable Long requestId) {
        UUID userId = UUID.fromString(authentication.getName());
        deletionService.cancelDeletionRequest(userId, requestId);
        return ResponseEntity.ok(ApiResponse.success(SuccessCode.DELETION_CANCEL_SUCCESS));
    }
}