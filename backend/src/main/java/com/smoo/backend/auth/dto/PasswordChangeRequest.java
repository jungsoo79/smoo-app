package com.smoo.backend.auth.dto;

import lombok.Getter;

@Getter
public class PasswordChangeRequest {
    private String currentPassword;
    private String newPassword;
}