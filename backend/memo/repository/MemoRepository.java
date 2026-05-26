package com.smoo.backend.memo.repository;

import com.smoo.backend.memo.domain.Memo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface MemoRepository extends JpaRepository<Memo, Long> {

    Optional<Memo> findByIdAndUserIdAndDeletedAtIsNull(Long id, UUID userId);

    @Query("""
        SELECT m
        FROM Memo m
        WHERE m.userId = :userId
          AND m.deletedAt IS NULL
          AND (:categoryId IS NULL OR m.categoryId = :categoryId)
          AND (
                :keyword IS NULL
                OR :keyword = ''
                OR LOWER(m.title) LIKE LOWER(CONCAT('%', :keyword, '%'))
                OR LOWER(m.content) LIKE LOWER(CONCAT('%', :keyword, '%'))
          )
        ORDER BY m.pinned DESC, m.updatedAt DESC
    """)
    List<Memo> searchMemos(
            @Param("userId") UUID userId,
            @Param("keyword") String keyword,
            @Param("categoryId") Long categoryId
    );
}