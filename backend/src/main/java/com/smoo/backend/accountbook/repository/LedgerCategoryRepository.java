package com.smoo.backend.accountbook.repository;

import com.smoo.backend.accountbook.domain.LedgerCategory;
import com.smoo.backend.accountbook.domain.TransactionType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface LedgerCategoryRepository extends JpaRepository<LedgerCategory, Long> {

    List<LedgerCategory> findByUserId(UUID userId);

    List<LedgerCategory> findByUserIdAndType(UUID userId, TransactionType type);

    Optional<LedgerCategory> findByIdAndUserId(Long id, UUID userId);
}