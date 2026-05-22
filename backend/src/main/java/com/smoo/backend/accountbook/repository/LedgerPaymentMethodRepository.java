package com.smoo.backend.accountbook.repository;

import com.smoo.backend.accountbook.domain.LedgerPaymentMethod;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface LedgerPaymentMethodRepository extends JpaRepository<LedgerPaymentMethod, Long> {

    List<LedgerPaymentMethod> findByUserId(UUID userId);

    Optional<LedgerPaymentMethod> findByIdAndUserId(Long id, UUID userId);
}