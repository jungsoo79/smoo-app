package com.smoo.backend.auth.dto;

import lombok.Getter;
import lombok.Setter;
import java.time.OffsetDateTime;

@Getter
@Setter
public class LoginResponse {
    private String accessToken;
    private String refreshToken;
    private String tokenType;
    private Long expiresIn;
    private Boolean isDeletionPending;
    private OffsetDateTime scheduledDeleteAt;
}