package com.smoo.backend.memo.repository;

import com.smoo.backend.memo.domain.MemoCategory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface MemoCategoryRepository extends JpaRepository<MemoCategory, Long> {

    List<MemoCategory> findByUserIdOrderByCreatedAtAsc(UUID userId);

    Optional<MemoCategory> findByIdAndUserId(Long id, UUID userId);
}