package com.smoo.backend.profile.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class ProfileResponse {
    private String name;
    private String email;
    private String avatarUrl;
    private String bio;
}