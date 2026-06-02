package com.smoo.backend.task.dto.response;

import com.smoo.backend.task.domain.TaskStatus;

import java.time.LocalDate;
import java.time.OffsetDateTime;

public class TaskResponse {

    private Long id;
    private String title;
    private String memo;
    private TaskStatus status;
    private Boolean completed;
    private LocalDate dueDate;
    private Long categoryId;
    private String categoryName;
    private String categoryColor;
    private Integer sortOrder;
    private OffsetDateTime completedAt;

    public TaskResponse(
            Long id,
            String title,
            String memo,
            TaskStatus status,
            Boolean completed,
            LocalDate dueDate,
            Long categoryId,
            String categoryName,
            String categoryColor,
            Integer sortOrder,
            OffsetDateTime completedAt
    ) {
        this.id = id;
        this.title = title;
        this.memo = memo;
        this.status = status;
        this.completed = completed;
        this.dueDate = dueDate;
        this.categoryId = categoryId;
        this.categoryName = categoryName;
        this.categoryColor = categoryColor;
        this.sortOrder = sortOrder;
        this.completedAt = completedAt;
    }

    public Long getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public String getMemo() {
        return memo;
    }

    public TaskStatus getStatus() {
        return status;
    }

    public Boolean getCompleted() {
        return completed;
    }

    public LocalDate getDueDate() {
        return dueDate;
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

    public Integer getSortOrder() {
        return sortOrder;
    }

    public OffsetDateTime getCompletedAt() {
        return completedAt;
    }
}