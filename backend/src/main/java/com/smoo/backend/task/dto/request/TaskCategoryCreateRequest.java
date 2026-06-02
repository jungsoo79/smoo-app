package com.smoo.backend.task.dto.request;

import jakarta.validation.constraints.NotBlank;

public class TaskCategoryCreateRequest {

    @NotBlank(message = "카테고리 이름은 필수입니다.")
    private String name;

    private String color;

    public String getName() {
        return name;
    }

    public String getColor() {
        return color;
    }
}