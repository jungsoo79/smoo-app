package com.smoo.backend.accountbook.repository;

import com.smoo.backend.accountbook.domain.LedgerTransaction;
import com.smoo.backend.accountbook.domain.TransactionType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface LedgerTransactionRepository extends JpaRepository<LedgerTransaction, Long> {

    Optional<LedgerTransaction> findByIdAndUserId(Long id, UUID userId);

    List<LedgerTransaction> findByUserIdAndTransactionDateOrderByCreatedAtDesc(
            UUID userId,
            LocalDate transactionDate
    );

    List<LedgerTransaction> findByUserIdAndTransactionDateBetweenOrderByTransactionDateDescCreatedAtDesc(
            UUID userId,
            LocalDate startDate,
            LocalDate endDate
    );

    List<LedgerTransaction> findByUserId(UUID userId);

    List<LedgerTransaction> findByUserIdAndType(UUID userId, TransactionType type);

    List<LedgerTransaction> findByUserIdAndTypeAndTransactionDateBetween(
            UUID userId,
            TransactionType type,
            LocalDate startDate,
            LocalDate endDate
    );

    List<LedgerTransaction> findByUserIdAndTransactionDateBetween(
            UUID userId,
            LocalDate startDate,
            LocalDate endDate
    );
}