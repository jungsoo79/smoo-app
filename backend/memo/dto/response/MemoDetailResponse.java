package com.smoo.backend.memo.dto.response;

import java.time.OffsetDateTime;
import java.util.List;

public class MemoDetailResponse {

    private Long id;
    private Long categoryId;
    private String categoryName;
    private String categoryColor;
    private String title;
    private String content;
    private Boolean pinned;
    private List<MemoAttachmentResponse> attachments;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;

    public MemoDetailResponse(
            Long id,
            Long categoryId,
            String categoryName,
            String categoryColor,
            String title,
            String content,
            Boolean pinned,
            List<MemoAttachmentResponse> attachments,
            OffsetDateTime createdAt,
            OffsetDateTime updatedAt
    ) {
        this.id = id;
        this.categoryId = categoryId;
        this.categoryName = categoryName;
        this.categoryColor = categoryColor;
        this.title = title;
        this.content = content;
        this.pinned = pinned;
        this.attachments = attachments;
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

    public String getContent() {
        return content;
    }

    public Boolean getPinned() {
        return pinned;
    }

    public List<MemoAttachmentResponse> getAttachments() {
        return attachments;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }

    public OffsetDateTime getUpdatedAt() {
        return updatedAt;
    }
}