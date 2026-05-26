package com.smoo.backend.task.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public class TaskCreateRequest {

    @NotBlank(message = "할 일 제목은 필수입니다.")
    private String title;

    private String memo;

    @NotNull(message = "할 일 날짜는 필수입니다.")
    private LocalDate dueDate;

    private Long categoryId;

    public String getTitle() {
        return title;
    }

    public String getMemo() {
        return memo;
    }

    public LocalDate getDueDate() {
        return dueDate;
    }

    public Long getCategoryId() {
        return categoryId;
    }
}