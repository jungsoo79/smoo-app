package com.smoo.backend.task.domain;

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
@Table(name = "task_categories")
public class TaskCategory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 카테고리를 소유한 사용자 ID
    @Column(name = "user_id", nullable = false)
    private UUID userId;

    // 카테고리 이름: 업무, 약속, 운동 등
    @Column(name = "name", nullable = false)
    private String name;

    // 카테고리 색상
    @Column(name = "color", nullable = false)
    private String color;

    // 기본 카테고리 여부
    @Column(name = "is_default", nullable = false)
    private Boolean isDefault;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    private TaskCategory(UUID userId, String name, String color, Boolean isDefault) {
        this.userId = userId;
        this.name = name;
        this.color = color;
        this.isDefault = isDefault;
    }

    public static TaskCategory create(UUID userId, String name, String color, Boolean isDefault) {
        return new TaskCategory(
                userId,
                name,
                color != null ? color : "#999999",
                isDefault != null ? isDefault : false
        );
    }

    public void update(String name, String color) {
        this.name = name;
        this.color = color != null ? color : "#999999";
    }
}