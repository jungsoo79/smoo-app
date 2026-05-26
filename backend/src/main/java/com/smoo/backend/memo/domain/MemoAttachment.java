package com.smoo.backend.memo.domain;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.OffsetDateTime;
import java.util.UUID;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Entity
@Table(name = "memo_attachments")
public class MemoAttachment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "memo_id", nullable = false)
    private Long memoId;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "original_file_name", nullable = false)
    private String originalFileName;

    @Column(name = "file_url", nullable = false)
    private String fileUrl;

    @Column(name = "file_type")
    private String fileType;

    @Column(name = "file_size")
    private Long fileSize;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    private MemoAttachment(
            Long memoId,
            UUID userId,
            String originalFileName,
            String fileUrl,
            String fileType,
            Long fileSize
    ) {
        this.memoId = memoId;
        this.userId = userId;
        this.originalFileName = originalFileName;
        this.fileUrl = fileUrl;
        this.fileType = fileType;
        this.fileSize = fileSize;
    }

    public static MemoAttachment create(
            Long memoId,
            UUID userId,
            String originalFileName,
            String fileUrl,
            String fileType,
            Long fileSize
    ) {
        return new MemoAttachment(memoId, userId, originalFileName, fileUrl, fileType, fileSize);
    }
}