package com.smoo.backend.home.dto.response;

import com.smoo.backend.home.domain.WidgetType;

public class AvailableWidgetResponse {

    private WidgetType widgetType;
    private String displayName;
    private Boolean added;

    public AvailableWidgetResponse(WidgetType widgetType, String displayName, Boolean added) {
        this.widgetType = widgetType;
        this.displayName = displayName;
        this.added = added;
    }

    public WidgetType getWidgetType() {
        return widgetType;
    }

    public String getDisplayName() {
        return displayName;
    }

    public Boolean getAdded() {
        return added;
    }
}