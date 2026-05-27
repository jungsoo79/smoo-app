package com.smoo.backend.schedule.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import java.time.OffsetDateTime;

@Getter
public class ScheduleCreateRequest {

    @NotBlank
    private String title;

    private String description;

    @NotNull
    private OffsetDateTime startAt;

    private OffsetDateTime endAt;

    private String location;
}