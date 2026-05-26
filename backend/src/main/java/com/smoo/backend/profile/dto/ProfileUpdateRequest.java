package com.smoo.backend.profile.dto;

import lombok.Getter;

@Getter
public class ProfileUpdateRequest {
    private String name;
    private String avatarUrl;
    private String bio;
}