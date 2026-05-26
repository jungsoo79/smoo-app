package com.smoo.backend.home.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;

import java.util.List;

public class WidgetReorderRequest {

    @Valid
    @NotEmpty(message = "위젯 순서 정보는 비어 있을 수 없습니다.")
    private List<WidgetOrderRequest> orders;

    public List<WidgetOrderRequest> getOrders() {
        return orders;
    }
}