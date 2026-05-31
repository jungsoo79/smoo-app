package com.smoo.backend.profile.dto;

import com.smoo.backend.profile.Profile;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class ProfileResponse {

    private String name;
    private String email;
    private String avatarUrl;
    private String bio;

    public static ProfileResponse from(Profile profile) {
        return new ProfileResponse(
                profile.getName(),
                profile.getEmail(),
                profile.getAvatarUrl(),
                profile.getBio()
        );
    }
}