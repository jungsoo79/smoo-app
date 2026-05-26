package com.smoo.backend.memo.dto.response;

public class MemoAttachmentResponse {

    private Long id;
    private String originalFileName;
    private String fileUrl;
    private String fileType;
    private Long fileSize;

    public MemoAttachmentResponse(
            Long id,
            String originalFileName,
            String fileUrl,
            String fileType,
            Long fileSize
    ) {
        this.id = id;
        this.originalFileName = originalFileName;
        this.fileUrl = fileUrl;
        this.fileType = fileType;
        this.fileSize = fileSize;
    }

    public Long getId() {
        return id;
    }

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