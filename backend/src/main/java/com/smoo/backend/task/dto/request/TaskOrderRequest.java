package com.smoo.backend.task.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public class TaskOrderRequest {

    @NotNull(message = "할 일 ID는 필수입니다.")
    private Long taskId;

    @NotNull(message = "정렬 순서는 필수입니다.")
    @Min(value = 0, message = "정렬 순서는 0 이상이어야 합니다.")
    private Integer sortOrder;

    public Long getTaskId() {
        return taskId;
    }

    public Integer getSortOrder() {
        return sortOrder;
    }
}