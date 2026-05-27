package com.smoo.backend.home.dto.response;

import com.smoo.backend.home.domain.WidgetType;

public class DashboardWidgetResponse {

    private Long id;
    private WidgetType widgetType;
    private String displayName;
    private Integer displayOrder;
    private Boolean enabled;

    public DashboardWidgetResponse(
            Long id,
            WidgetType widgetType,
            String displayName,
            Integer displayOrder,
            Boolean enabled
    ) {
        this.id = id;
        this.widgetType = widgetType;
        this.displayName = displayName;
        this.displayOrder = displayOrder;
        this.enabled = enabled;
    }

    public Long getId() {
        return id;
    }

    public WidgetType getWidgetType() {
        return widgetType;
    }

    public String getDisplayName() {
        return displayName;
    }

    public Integer getDisplayOrder() {
        return displayOrder;
    }

    public Boolean getEnabled() {
        return enabled;
    }
}