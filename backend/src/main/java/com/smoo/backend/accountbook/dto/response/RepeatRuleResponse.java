package com.smoo.backend.accountbook.dto.response;

import com.smoo.backend.accountbook.domain.RepeatCycle;

public class RepeatRuleResponse {

    private Long id;
    private String name;
    private RepeatCycle cycle;
    private Boolean isDefault;

    public RepeatRuleResponse(Long id, String name, RepeatCycle cycle, Boolean isDefault) {
        this.id = id;
        this.name = name;
        this.cycle = cycle;
        this.isDefault = isDefault;
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public RepeatCycle getCycle() {
        return cycle;
    }

    public Boolean getIsDefault() {
        return isDefault;
    }
}
