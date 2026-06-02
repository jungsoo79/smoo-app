package com.smoo.backend.accountbook.repository;

import com.smoo.backend.accountbook.domain.LedgerRepeatRule;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface LedgerRepeatRuleRepository extends JpaRepository<LedgerRepeatRule, Long> {

    List<LedgerRepeatRule> findByUserId(UUID userId);

    Optional<LedgerRepeatRule> findByIdAndUserId(Long id, UUID userId);
}