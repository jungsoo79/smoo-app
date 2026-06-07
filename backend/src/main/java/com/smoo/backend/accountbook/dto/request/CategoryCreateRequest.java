package com.smoo.backend.accountbook.dto.request;

import com.smoo.backend.accountbook.domain.TransactionType;
import jakarta.validation.constraints.NotBlank;

public class CategoryCreateRequest {

    @NotBlank(message = "Category name is required.")
    private String name;

    private String color;

    private TransactionType type;

    public String getName() {
        return name;
    }

    public String getColor() {
        return color;
    }

    public TransactionType getType() {
        return type;
    }
}
