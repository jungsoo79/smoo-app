package com.smoo.backend.task.repository;

import com.smoo.backend.task.domain.Task;
import com.smoo.backend.task.domain.TaskStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface TaskRepository extends JpaRepository<Task, Long> {

    Optional<Task> findByIdAndUserIdAndDeletedAtIsNull(Long id, UUID userId);

    List<Task> findByUserIdAndDueDateAndDeletedAtIsNullOrderByCategoryIdAscSortOrderAscCreatedAtAsc(
            UUID userId,
            LocalDate dueDate
    );

    List<Task> findByUserIdAndStatusAndDeletedAtIsNull(UUID userId, TaskStatus status);

    @Query("""
        SELECT COALESCE(MAX(t.sortOrder), 0)
        FROM Task t
        WHERE t.userId = :userId
          AND t.dueDate = :dueDate
          AND t.deletedAt IS NULL
    """)
    Integer findMaxSortOrderByUserIdAndDueDate(
            @Param("userId") UUID userId,
            @Param("dueDate") LocalDate dueDate
    );
}