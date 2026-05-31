package com.smoo.backend.settings.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class NotificationsUpdateRequest {

    private Boolean pushEnabled;
    private Boolean scheduleReminderEnabled;
    private Boolean todoReminderEnabled;
    private Boolean serviceNotificationEnabled;
}