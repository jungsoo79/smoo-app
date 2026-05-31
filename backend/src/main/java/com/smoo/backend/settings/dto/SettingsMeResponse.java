package com.smoo.backend.settings.dto;

import com.smoo.backend.profile.dto.ProfileResponse;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class SettingsMeResponse {

    private ProfileResponse profile;
    private PreferencesResponse preferences;
    private NotificationsResponse notifications;
}