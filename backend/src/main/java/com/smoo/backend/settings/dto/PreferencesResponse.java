package com.smoo.backend.settings.dto;

import com.smoo.backend.settings.UserPreferences;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class PreferencesResponse {

    private String theme;
    private Boolean useSystemTheme;
    private String language;
    private String timeZone;

    public static PreferencesResponse from(UserPreferences preferences) {
        return new PreferencesResponse(
                preferences.getTheme(),
                preferences.getUseSystemTheme(),
                preferences.getLanguage(),
                preferences.getTimeZone()
        );
    }
}