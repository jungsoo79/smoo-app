package com.smoo.backend.task.dto.response;

public class TaskCategoryResponse {

    private Long id;
    private String name;
    private String color;
    private Boolean isDefault;

    public TaskCategoryResponse(Long id, String name, String color, Boolean isDefault) {
        this.id = id;
        this.name = name;
        this.color = color;
        this.isDefault = isDefault;
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getColor() {
        return color;
    }

    public Boolean getIsDefault() {
        return isDefault;
    }
}