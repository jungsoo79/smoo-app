package com.smoo.backend.home.dto.request;

import com.smoo.backend.home.domain.WidgetType;
import jakarta.validation.constraints.NotNull;

public class WidgetCreateRequest {

    @NotNull(message = "위젯 타입은 필수입니다.")
    private WidgetType widgetType;

    public WidgetType getWidgetType() {
        return widgetType;
    }
}