package com.smoo.backend.memo.dto.request;

import jakarta.validation.constraints.NotBlank;

public class MemoAttachmentCreateRequest {

    @NotBlank(message = "파일명은 필수입니다.")
    private String originalFileName;

    @NotBlank(message = "파일 URL은 필수입니다.")
    private String fileUrl;

    private String fileType;

    private Long fileSize;

    public String getOriginalFileName() {
        return originalFileName;
    }

    public String getFileUrl() {
        return fileUrl;
    }

    public String getFileType() {
        return fileType;
    }

    public Long getFileSize() {
        return fileSize;
    }
}