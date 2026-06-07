package com.smoo.backend.settings;

import com.smoo.backend.common.exception.CustomException;
import com.smoo.backend.common.exception.ErrorCode;
import com.smoo.backend.settings.dto.PreferencesResponse;
import com.smoo.backend.settings.dto.PreferencesUpdateRequest;
import com.smoo.backend.settings.dto.PushPreferencesResponse;
import com.smoo.backend.settings.dto.PushPreferencesUpdateRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.OffsetDateTime;
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
    public PushPreferencesResponse getPushPreferences(UUID userId) {
        UserPreferences preferences = getOrCreatePreferences(userId);

        return toPushPreferencesResponse(preferences);
    }

    @Transactional
    public PushPreferencesResponse updatePushPreferences(UUID userId, PushPreferencesUpdateRequest request) {
        UserPreferences preferences = getOrCreatePreferences(userId);

        if (request.getAllPush() != null) {
            preferences.setAllPush(request.getAllPush());
        }

        if (request.getSchedulePush() != null) {
            preferences.setSchedulePush(request.getSchedulePush());
        }

        if (request.getTodoPush() != null) {
            preferences.setTodoPush(request.getTodoPush());
        }

        if (request.getServicePush() != null) {
            preferences.setServicePush(request.getServicePush());
        }

        preferences.setUpdatedAt(OffsetDateTime.now());
        userPreferencesRepository.save(preferences);

        return toPushPreferencesResponse(preferences);
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

    private UserPreferences getOrCreatePreferences(UUID userId) {
        return userPreferencesRepository.findByUserId(userId)
                .orElseGet(() -> {
                    OffsetDateTime now = OffsetDateTime.now();
                    UserPreferences preferences = new UserPreferences();
                    preferences.setUserId(userId);
                    preferences.setTheme("system");
                    preferences.setLanguage("ko");
                    preferences.setAllPush(true);
                    preferences.setSchedulePush(true);
                    preferences.setTodoPush(true);
                    preferences.setServicePush(false);
                    preferences.setCreatedAt(now);
                    preferences.setUpdatedAt(now);

                    return userPreferencesRepository.save(preferences);
                });
    }

    private PushPreferencesResponse toPushPreferencesResponse(UserPreferences preferences) {
        return new PushPreferencesResponse(
                defaultBoolean(preferences.getAllPush(), true),
                defaultBoolean(preferences.getSchedulePush(), true),
                defaultBoolean(preferences.getTodoPush(), true),
                defaultBoolean(preferences.getServicePush(), false)
        );
    }

    private Boolean defaultBoolean(Boolean value, Boolean defaultValue) {
        return value != null ? value : defaultValue;
    }
}
