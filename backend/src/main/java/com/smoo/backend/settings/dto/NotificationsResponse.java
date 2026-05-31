package com.smoo.backend.settings.dto;

import com.smoo.backend.settings.NotificationSettings;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class NotificationsResponse {

    private Boolean pushEnabled;
    private Boolean scheduleReminderEnabled;
    private Boolean todoReminderEnabled;
    private Boolean goalReminderEnabled;
    private Boolean serviceNotificationEnabled;
    private Boolean quietHoursEnabled;

    public static NotificationsResponse from(NotificationSettings settings) {
        return new NotificationsResponse(
                settings.getPushEnabled(),
                settings.getScheduleReminderEnabled(),
                settings.getTodoReminderEnabled(),
                settings.getGoalReminderEnabled(),
                settings.getServiceNotificationEnabled(),
                settings.getQuietHoursEnabled()
        );
    }
}