package com.smoo.backend.task.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.util.List;

public class TaskReorderRequest {

    @NotNull(message = "날짜는 필수입니다.")
    private LocalDate date;

    @Valid
    @NotEmpty(message = "정렬 정보는 비어 있을 수 없습니다.")
    private List<TaskOrderRequest> orders;

    public LocalDate getDate() {
        return date;
    }

    public List<TaskOrderRequest> getOrders() {
        return orders;
    }
}