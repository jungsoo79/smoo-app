package com.smoo.backend.home.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public class WidgetOrderRequest {

    @NotNull(message = "위젯 ID는 필수입니다.")
    private Long widgetId;

    @NotNull(message = "표시 순서는 필수입니다.")
    @Min(value = 0, message = "표시 순서는 0 이상이어야 합니다.")
    private Integer displayOrder;

    public Long getWidgetId() {
        return widgetId;
    }

    public Integer getDisplayOrder() {
        return displayOrder;
    }
}