package com.smoo.backend.settings;

import com.smoo.backend.common.response.ApiResponse;
import com.smoo.backend.common.response.SuccessCode;
import com.smoo.backend.settings.dto.PreferencesResponse;
import com.smoo.backend.settings.dto.PreferencesUpdateRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/settings")
@RequiredArgsConstructor
public class SettingsController {

    private final SettingsService settingsService;

    @GetMapping("/preferences")
    public ResponseEntity<ApiResponse<PreferencesResponse>> getPreferences(Authentication authentication) {
        UUID userId = UUID.fromString(authentication.getName());
        PreferencesResponse response = settingsService.getPreferences(userId);
        return ResponseEntity.ok(ApiResponse.success(SuccessCode.COMMON_SUCCESS, response));
    }

    @PatchMapping("/preferences")
    public ResponseEntity<ApiResponse<PreferencesResponse>> updatePreferences(
            Authentication authentication,
            @RequestBody PreferencesUpdateRequest request) {
        UUID userId = UUID.fromString(authentication.getName());
        PreferencesResponse response = settingsService.updatePreferences(userId, request);
        return ResponseEntity.ok(ApiResponse.success(SuccessCode.UPDATED, response));
    }
}