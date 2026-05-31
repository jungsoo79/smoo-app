package com.smoo.backend.settings;

import com.smoo.backend.common.response.ApiResponse;
import com.smoo.backend.common.response.SuccessCode;
import com.smoo.backend.settings.dto.NotificationsResponse;
import com.smoo.backend.settings.dto.NotificationsUpdateRequest;
import com.smoo.backend.settings.dto.PreferencesResponse;
import com.smoo.backend.settings.dto.PreferencesUpdateRequest;
import com.smoo.backend.settings.dto.SettingsMeResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/settings")
@RequiredArgsConstructor
public class SettingsController {

    private final SettingsService settingsService;

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<SettingsMeResponse>> getMySettings(Authentication authentication) {
        UUID userId = getUserId(authentication);
        SettingsMeResponse response = settingsService.getMySettings(userId);
        return ResponseEntity.ok(ApiResponse.success(SuccessCode.COMMON_SUCCESS, response));
    }

    @GetMapping("/preferences")
    public ResponseEntity<ApiResponse<PreferencesResponse>> getPreferences(Authentication authentication) {
        UUID userId = getUserId(authentication);
        PreferencesResponse response = settingsService.getPreferences(userId);
        return ResponseEntity.ok(ApiResponse.success(SuccessCode.COMMON_SUCCESS, response));
    }

    @PatchMapping("/preferences")
    public ResponseEntity<ApiResponse<PreferencesResponse>> updatePreferences(
            Authentication authentication,
            @RequestBody PreferencesUpdateRequest request
    ) {
        UUID userId = getUserId(authentication);
        PreferencesResponse response = settingsService.updatePreferences(userId, request);
        return ResponseEntity.ok(ApiResponse.success(SuccessCode.UPDATED, response));
    }

    @GetMapping("/notifications")
    public ResponseEntity<ApiResponse<NotificationsResponse>> getNotifications(Authentication authentication) {
        UUID userId = getUserId(authentication);
        NotificationsResponse response = settingsService.getNotifications(userId);
        return ResponseEntity.ok(ApiResponse.success(SuccessCode.COMMON_SUCCESS, response));
    }

    @PatchMapping("/notifications")
    public ResponseEntity<ApiResponse<NotificationsResponse>> updateNotifications(
            Authentication authentication,
            @RequestBody NotificationsUpdateRequest request
    ) {
        UUID userId = getUserId(authentication);
        NotificationsResponse response = settingsService.updateNotifications(userId, request);
        return ResponseEntity.ok(ApiResponse.success(SuccessCode.UPDATED, response));
    }

    private UUID getUserId(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "로그인이 필요합니다.");
        }

        try {
            return UUID.fromString(authentication.getName());
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "유효하지 않은 사용자 인증 정보입니다.");
        }
    }
}

