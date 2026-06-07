package com.smoo.backend.accountbook.dto.response;

import com.smoo.backend.accountbook.domain.TransactionType;

public class CategoryResponse {

    private Long id;
    private String name;
    private String color;
    private TransactionType type;
    private Boolean isDefault;

    public CategoryResponse(Long id, String name, String color, TransactionType type, Boolean isDefault) {
        this.id = id;
        this.name = name;
        this.color = color;
        this.type = type;
        this.isDefault = isDefault;
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getColor() {
        return color;
    }

    public TransactionType getType() {
        return type;
    }

    public Boolean getIsDefault() {
        return isDefault;
    }
}
