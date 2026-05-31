package com.smoo.backend.settings;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalTime;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "notification_settings", schema = "public")
@Getter
@Setter
@NoArgsConstructor
public class NotificationSettings {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", nullable = false)
    private UUID id;

    @Column(name = "user_id", nullable = false, unique = true)
    private UUID userId;

    @Column(name = "push_enabled", nullable = false)
    private Boolean pushEnabled = true;

    @Column(name = "schedule_reminder_enabled", nullable = false)
    private Boolean scheduleReminderEnabled = true;

    @Column(name = "todo_reminder_enabled", nullable = false)
    private Boolean todoReminderEnabled = true;

    @Column(name = "goal_reminder_enabled", nullable = false)
    private Boolean goalReminderEnabled = true;

    @Column(name = "service_notification_enabled", nullable = false)
    private Boolean serviceNotificationEnabled = false;

    @Column(name = "quiet_hours_enabled", nullable = false)
    private Boolean quietHoursEnabled = false;

    @Column(name = "quiet_start_time")
    private LocalTime quietStartTime;

    @Column(name = "quiet_end_time")
    private LocalTime quietEndTime;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    public static NotificationSettings createDefault(UUID userId) {
        NotificationSettings settings = new NotificationSettings();
        settings.setUserId(userId);
        settings.setPushEnabled(true);
        settings.setScheduleReminderEnabled(true);
        settings.setTodoReminderEnabled(true);
        settings.setGoalReminderEnabled(true);
        settings.setServiceNotificationEnabled(false);
        settings.setQuietHoursEnabled(false);
        return settings;
    }

    @PrePersist
    protected void onCreate() {
        OffsetDateTime now = OffsetDateTime.now();
        this.createdAt = now;
        this.updatedAt = now;
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = OffsetDateTime.now();
    }
}