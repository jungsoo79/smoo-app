package com.smoo.backend.accountbook.repository;

import com.smoo.backend.accountbook.domain.LedgerBook;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface LedgerBookRepository extends JpaRepository<LedgerBook, Long> {

    Optional<LedgerBook> findByUserId(UUID userId);
}