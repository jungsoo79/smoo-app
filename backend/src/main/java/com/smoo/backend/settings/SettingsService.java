package com.smoo.backend.settings;

import com.smoo.backend.common.exception.CustomException;
import com.smoo.backend.common.exception.ErrorCode;
import com.smoo.backend.settings.dto.PreferencesResponse;
import com.smoo.backend.settings.dto.PreferencesUpdateRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.UUID;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SettingsService {

    private final UserPreferencesRepository userPreferencesRepository;

    public PreferencesResponse getPreferences(UUID userId) {
        UserPreferences preferences = userPreferencesRepository.findByUserId(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.PREFERENCES_NOT_FOUND));

        return new PreferencesResponse(
                preferences.getTheme(),
                preferences.getLanguage()
        );
    }

    @Transactional
    public PreferencesResponse updatePreferences(UUID userId, PreferencesUpdateRequest request) {
        UserPreferences preferences = userPreferencesRepository.findByUserId(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.PREFERENCES_NOT_FOUND));

        if (request.getTheme() != null) {
            List<String> validThemes = List.of("system", "light", "dark");
            if (!validThemes.contains(request.getTheme())) {
                throw new CustomException(ErrorCode.INVALID_THEME);
            }
            preferences.setTheme(request.getTheme());
        }

        if (request.getLanguage() != null) {
            List<String> validLanguages = List.of("ko", "en");
            if (!validLanguages.contains(request.getLanguage())) {
                throw new CustomException(ErrorCode.INVALID_LANGUAGE);
            }
            preferences.setLanguage(request.getLanguage());
        }

        userPreferencesRepository.save(preferences);

        return new PreferencesResponse(
                preferences.getTheme(),
                preferences.getLanguage()
        );
    }
}