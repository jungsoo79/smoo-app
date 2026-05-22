package com.smoo.backend.settings;

import com.smoo.backend.settings.dto.PreferencesResponse;
import com.smoo.backend.settings.dto.PreferencesUpdateRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/settings")
@RequiredArgsConstructor
public class SettingsController {

    private final SettingsService settingsService;

    @GetMapping("/preferences")
    public ResponseEntity<?> getPreferences(Authentication authentication) {
        try {
            UUID userId = UUID.fromString(authentication.getName());
            PreferencesResponse response = settingsService.getPreferences(userId);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            String errorCode = e.getMessage();
            return switch (errorCode) {
                case "PREFERENCES_NOT_FOUND" -> ResponseEntity.status(404).body(Map.of("error", errorCode));
                default -> ResponseEntity.status(500).body(Map.of("error", "SETTINGS_FAILED"));
            };
        }
    }

    @PatchMapping("/preferences")
    public ResponseEntity<?> updatePreferences(
            Authentication authentication,
            @RequestBody PreferencesUpdateRequest request) {
        try {
            UUID userId = UUID.fromString(authentication.getName());
            PreferencesResponse response = settingsService.updatePreferences(userId, request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            String errorCode = e.getMessage();
            return switch (errorCode) {
                case "PREFERENCES_NOT_FOUND" -> ResponseEntity.status(404).body(Map.of("error", errorCode));
                case "INVALID_THEME" -> ResponseEntity.status(400).body(Map.of("error", errorCode));
                case "INVALID_LANGUAGE" -> ResponseEntity.status(400).body(Map.of("error", errorCode));
                default -> ResponseEntity.status(500).body(Map.of("error", "UPDATE_FAILED"));
            };
        }
    }
}