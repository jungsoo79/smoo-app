package com.smoo.backend.task.domain;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Entity
@Table(name = "tasks")
public class Task {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // public.profiles(id)와 연결되는 사용자 ID
    @Column(name = "user_id", nullable = false)
    private UUID userId;

    // 할 일 제목
    @Column(name = "title", nullable = false)
    private String title;

    // 화면에서는 memo로 쓰지만 DB 컬럼은 description
    @Column(name = "description")
    private String memo;

    // pending 또는 completed
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private TaskStatus status;

    // 할 일 날짜
    @Column(name = "due_date")
    private LocalDate dueDate;

    // 카테고리 ID
    @Column(name = "category_id")
    private Long categoryId;

    // 드래그 정렬 순서
    @Column(name = "sort_order", nullable = false)
    private Integer sortOrder;

    // 완료 시각
    @Column(name = "completed_at")
    private OffsetDateTime completedAt;

    // 소프트 삭제 시각
    @Column(name = "deleted_at")
    private OffsetDateTime deletedAt;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    private Task(
            UUID userId,
            String title,
            String memo,
            LocalDate dueDate,
            Long categoryId,
            Integer sortOrder
    ) {
        this.userId = userId;
        this.title = title;
        this.memo = memo;
        this.status = TaskStatus.pending;
        this.dueDate = dueDate;
        this.categoryId = categoryId;
        this.sortOrder = sortOrder;
    }

    public static Task create(
            UUID userId,
            String title,
            String memo,
            LocalDate dueDate,
            Long categoryId,
            Integer sortOrder
    ) {
        return new Task(userId, title, memo, dueDate, categoryId, sortOrder);
    }

    public void update(String title, String memo, LocalDate dueDate, Long categoryId) {
        this.title = title;
        this.memo = memo;
        this.dueDate = dueDate;
        this.categoryId = categoryId;
    }

    public void complete() {
        this.status = TaskStatus.completed;
        this.completedAt = OffsetDateTime.now();
    }

    public void incomplete() {
        this.status = TaskStatus.pending;
        this.completedAt = null;
    }

    public void updateSortOrder(Integer sortOrder) {
        this.sortOrder = sortOrder;
    }

    public void delete() {
        this.deletedAt = OffsetDateTime.now();
    }
}