package com.smoo.backend.home.domain;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.OffsetDateTime;
import java.util.UUID;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Entity
@Table(name = "dashboard_widgets")
public class DashboardWidget {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // public.profiles(id)와 연결되는 사용자 ID
    @Column(name = "user_id", nullable = false)
    private UUID userId;

    // TODO, SCHEDULE, MEMO, LEDGER, CALENDAR
    @Enumerated(EnumType.STRING)
    @Column(name = "widget_type", nullable = false)
    private WidgetType widgetType;

    // 홈 화면에서 위젯이 보이는 순서
    @Column(name = "display_order", nullable = false)
    private Integer displayOrder;

    // 위젯 활성화 여부
    @Column(name = "enabled", nullable = false)
    private Boolean enabled;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    private DashboardWidget(UUID userId, WidgetType widgetType, Integer displayOrder) {
        this.userId = userId;
        this.widgetType = widgetType;
        this.displayOrder = displayOrder;
        this.enabled = true;
    }

    public static DashboardWidget create(UUID userId, WidgetType widgetType, Integer displayOrder) {
        return new DashboardWidget(userId, widgetType, displayOrder);
    }

    public void updateDisplayOrder(Integer displayOrder) {
        this.displayOrder = displayOrder;
    }

    public void disable() {
        this.enabled = false;
    }

    public void enable() {
        this.enabled = true;
    }
}