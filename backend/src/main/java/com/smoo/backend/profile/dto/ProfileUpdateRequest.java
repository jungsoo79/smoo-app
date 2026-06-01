package com.smoo.backend.profile.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class ProfileUpdateRequest {

    private String name;
    private String avatarUrl;
    private String bio;
}
