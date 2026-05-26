package com.smoo.backend.memo.repository;

import com.smoo.backend.memo.domain.MemoAttachment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface MemoAttachmentRepository extends JpaRepository<MemoAttachment, Long> {

    List<MemoAttachment> findByMemoIdAndUserIdOrderByCreatedAtAsc(Long memoId, UUID userId);

    Optional<MemoAttachment> findByIdAndMemoIdAndUserId(Long id, Long memoId, UUID userId);

    long countByMemoIdAndUserId(Long memoId, UUID userId);
}