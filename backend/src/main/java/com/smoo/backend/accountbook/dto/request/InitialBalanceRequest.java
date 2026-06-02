package com.smoo.backend.accountbook.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public class InitialBalanceRequest {

    @NotNull(message = "시작 금액은 필수입니다.")
    @Min(value = 0, message = "시작 금액은 0원 이상이어야 합니다.")
    private Long amount;

    public Long getAmount() {
        return amount;
    }
}