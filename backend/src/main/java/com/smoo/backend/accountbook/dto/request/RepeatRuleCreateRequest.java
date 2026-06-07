package com.smoo.backend.accountbook.dto.request;

import com.smoo.backend.accountbook.domain.RepeatCycle;
import jakarta.validation.constraints.NotNull;

public class RepeatRuleCreateRequest {

    private String name;

    @NotNull(message = "Repeat cycle is required.")
    private RepeatCycle cycle;

    public String getName() {
        return name;
    }

    public RepeatCycle getCycle() {
        return cycle;
    }
}
