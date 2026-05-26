package com.smoo.backend.schedule.dto;

import lombok.Getter;
import java.time.OffsetDateTime;

@Getter
public class ScheduleUpdateRequest {
    private String title;
    private String description;
    private OffsetDateTime startAt;
    private OffsetDateTime endAt;
    private String location;
}