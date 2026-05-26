package com.smoo.backend.memo.domain;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.OffsetDateTime;
import java.util.UUID;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Entity
@Table(name = "memos")
public class Memo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // public.profiles(id)와 연결되는 사용자 ID
    @Column(name = "user_id", nullable = false)
    private UUID userId;

    // 메모 카테고리 ID
    @Column(name = "category_id")
    private Long categoryId;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "content", columnDefinition = "text")
    private String content;

    @Column(name = "pinned", nullable = false)
    private Boolean pinned;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    @Column(name = "deleted_at")
    private OffsetDateTime deletedAt;

    private Memo(UUID userId, Long categoryId, String title, String content, Boolean pinned) {
        this.userId = userId;
        this.categoryId = categoryId;
        this.title = title;
        this.content = content;
        this.pinned = pinned;
    }

    public static Memo create(UUID userId, Long categoryId, String title, String content, Boolean pinned) {
        return new Memo(userId, categoryId, title, content, pinned != null ? pinned : false);
    }

    public void update(Long categoryId, String title, String content, Boolean pinned) {
        this.categoryId = categoryId;
        this.title = title;
        this.content = content;
        this.pinned = pinned != null ? pinned : false;
    }

    public void delete() {
        this.deletedAt = OffsetDateTime.now();
    }
}