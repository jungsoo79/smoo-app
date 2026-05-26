package com.smoo.backend.memo.dto.response;

import java.time.OffsetDateTime;

public class MemoSummaryResponse {

    private Long id;
    private Long categoryId;
    private String categoryName;
    private String categoryColor;
    private String title;
    private String preview;
    private Boolean pinned;
    private Long attachmentCount;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;

    public MemoSummaryResponse(
            Long id,
            Long categoryId,
            String categoryName,
            String categoryColor,
            String title,
            String preview,
            Boolean pinned,
            Long attachmentCount,
            OffsetDateTime createdAt,
            OffsetDateTime updatedAt
    ) {
        this.id = id;
        this.categoryId = categoryId;
        this.categoryName = categoryName;
        this.categoryColor = categoryColor;
        this.title = title;
        this.preview = preview;
        this.pinned = pinned;
        this.attachmentCount = attachmentCount;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public Long getId() {
        return id;
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

    public String getTitle() {
        return title;
    }

    public String getPreview() {
        return preview;
    }

    public Boolean getPinned() {
        return pinned;
    }

    public Long getAttachmentCount() {
        return attachmentCount;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }

    public OffsetDateTime getUpdatedAt() {
        return updatedAt;
    }
}