package com.smoo.backend.accountbook.dto.response;

public class PaymentMethodResponse {

    private Long id;
    private String name;
    private Boolean isDefault;

    public PaymentMethodResponse(Long id, String name, Boolean isDefault) {
        this.id = id;
        this.name = name;
        this.isDefault = isDefault;
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public Boolean getIsDefault() {
        return isDefault;
    }
}
