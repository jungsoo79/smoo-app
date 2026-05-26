package com.smoo.backend.task.dto.response;

import java.util.List;

public class TaskCategoryGroupResponse {

    private Long categoryId;
    private String categoryName;
    private String categoryColor;
    private List<TaskResponse> tasks;

    public TaskCategoryGroupResponse(
            Long categoryId,
            String categoryName,
            String categoryColor,
            List<TaskResponse> tasks
    ) {
        this.categoryId = categoryId;
        this.categoryName = categoryName;
        this.categoryColor = categoryColor;
        this.tasks = tasks;
    }

    public Long getCategoryId() {
        return categoryId;
    }

    public String getCategoryName() {
        return categoryName;
    }

    public String getCategoryColor() {
        return categoryColor;
    }

    public List<TaskResponse> getTasks() {
        return tasks;
    }
}