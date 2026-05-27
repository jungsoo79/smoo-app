package com.smoo.backend.home.repository;

import com.smoo.backend.home.domain.DashboardWidget;
import com.smoo.backend.home.domain.WidgetType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface DashboardWidgetRepository extends JpaRepository<DashboardWidget, Long> {

    List<DashboardWidget> findByUserIdOrderByDisplayOrderAscIdAsc(UUID userId);

    List<DashboardWidget> findByUserIdAndEnabledTrueOrderByDisplayOrderAscIdAsc(UUID userId);

    Optional<DashboardWidget> findByIdAndUserId(Long id, UUID userId);

    Optional<DashboardWidget> findByUserIdAndWidgetType(UUID userId, WidgetType widgetType);

    boolean existsByUserIdAndWidgetType(UUID userId, WidgetType widgetType);

    @Query("""
        SELECT COALESCE(MAX(w.displayOrder), 0)
        FROM DashboardWidget w
        WHERE w.userId = :userId
    """)
    Integer findMaxDisplayOrderByUserId(UUID userId);
}