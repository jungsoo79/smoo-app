package com.smoo.backend.task.repository;

import com.smoo.backend.task.domain.TaskCategory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface TaskCategoryRepository extends JpaRepository<TaskCategory, Long> {

    List<TaskCategory> findByUserIdOrderByCreatedAtAsc(UUID userId);

    Optional<TaskCategory> findByIdAndUserId(Long id, UUID userId);
}