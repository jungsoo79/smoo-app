package com.smoo.backend.profile.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class ProfileOverviewResponse {
    private String name;
    private String email;
    private String avatarUrl;
    private long todayCompletedTaskCount;
    private long thisWeekScheduleCount;
    private long activeGoalCount;
}