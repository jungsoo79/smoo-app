package com.smoo.backend.memo.dto.request;

import jakarta.validation.constraints.NotBlank;

public class MemoUpdateRequest {

    private Long categoryId;

    @NotBlank(message = "메모 제목은 필수입니다.")
    private String title;

    private String content;

    private Boolean pinned;

    public Long getCategoryId() {
        return categoryId;
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
}