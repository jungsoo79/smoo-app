package com.smoo.backend.settings;

import com.smoo.backend.common.exception.CustomException;
import com.smoo.backend.common.exception.ErrorCode;
import com.smoo.backend.profile.Profile;
import com.smoo.backend.profile.ProfileRepository;
import com.smoo.backend.profile.dto.ProfileResponse;
import com.smoo.backend.settings.dto.NotificationsResponse;
import com.smoo.backend.settings.dto.NotificationsUpdateRequest;
import com.smoo.backend.settings.dto.PreferencesResponse;
import com.smoo.backend.settings.dto.PreferencesUpdateRequest;
import com.smoo.backend.settings.dto.SettingsMeResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SettingsService {

    private final UserPreferencesRepository userPreferencesRepository;
    private final NotificationSettingsRepository notificationSettingsRepository;
    private final ProfileRepository profileRepository;

    @Transactional
    public SettingsMeResponse getMySettings(UUID userId) {
        Profile profile = getProfile(userId);
        UserPreferences preferences = getOrCreatePreferences(userId);
        NotificationSettings notifications = getOrCreateNotifications(userId);

        return new SettingsMeResponse(
                ProfileResponse.from(profile),
                PreferencesResponse.from(preferences),
                NotificationsResponse.from(notifications)
        );
    }

    @Transactional
    public PreferencesResponse getPreferences(UUID userId) {
        UserPreferences preferences = getOrCreatePreferences(userId);
        return PreferencesResponse.from(preferences);
    }

    @Transactional
    public PreferencesResponse updatePreferences(UUID userId, PreferencesUpdateRequest request) {
        UserPreferences preferences = getOrCreatePreferences(userId);

        if (request.getTheme() != null) {
            validateTheme(request.getTheme());
            preferences.setTheme(request.getTheme());
        }

        if (request.getUseSystemTheme() != null) {
            preferences.setUseSystemTheme(request.getUseSystemTheme());

            if (request.getUseSystemTheme()) {
                preferences.setTheme("system");
            }
        }

        if (request.getLanguage() != null) {
            validateLanguage(request.getLanguage());
            preferences.setLanguage(request.getLanguage());
        }

        if (request.getTimeZone() != null) {
            preferences.setTimeZone(request.getTimeZone());
        }

        UserPreferences savedPreferences = userPreferencesRepository.save(preferences);
        return PreferencesResponse.from(savedPreferences);
    }

    @Transactional
    public NotificationsResponse getNotifications(UUID userId) {
        NotificationSettings notifications = getOrCreateNotifications(userId);
        return NotificationsResponse.from(notifications);
    }

    @Transactional
    public NotificationsResponse updateNotifications(UUID userId, NotificationsUpdateRequest request) {
        NotificationSettings notifications = getOrCreateNotifications(userId);

        if (request.getPushEnabled() != null) {
            notifications.setPushEnabled(request.getPushEnabled());
        }

        if (request.getScheduleReminderEnabled() != null) {
            notifications.setScheduleReminderEnabled(request.getScheduleReminderEnabled());
        }

        if (request.getTodoReminderEnabled() != null) {
            notifications.setTodoReminderEnabled(request.getTodoReminderEnabled());
        }

        if (request.getServiceNotificationEnabled() != null) {
            notifications.setServiceNotificationEnabled(request.getServiceNotificationEnabled());
        }

        NotificationSettings savedNotifications = notificationSettingsRepository.save(notifications);
        return NotificationsResponse.from(savedNotifications);
    }

    private Profile getProfile(UUID userId) {
        return profileRepository.findByIdAndDeletedAtIsNull(userId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "프로필 정보를 찾을 수 없습니다."
                ));
    }

    private UserPreferences getOrCreatePreferences(UUID userId) {
        return userPreferencesRepository.findByUserId(userId)
                .orElseGet(() -> userPreferencesRepository.save(UserPreferences.createDefault(userId)));
    }

    private NotificationSettings getOrCreateNotifications(UUID userId) {
        return notificationSettingsRepository.findByUserId(userId)
                .orElseGet(() -> notificationSettingsRepository.save(NotificationSettings.createDefault(userId)));
    }

    private void validateTheme(String theme) {
        List<String> validThemes = List.of("system", "light", "dark");

        if (!validThemes.contains(theme)) {
            throw new CustomException(ErrorCode.INVALID_THEME);
        }
    }

    private void validateLanguage(String language) {
        List<String> validLanguages = List.of("ko", "en");

        if (!validLanguages.contains(language)) {
            throw new CustomException(ErrorCode.INVALID_LANGUAGE);
        }
    }
}