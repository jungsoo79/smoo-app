package com.smoo.backend.profile;

import com.smoo.backend.common.response.ApiResponse;
import com.smoo.backend.common.response.SuccessCode;
import com.smoo.backend.profile.dto.ProfileOverviewResponse;
import com.smoo.backend.profile.dto.ProfileResponse;
import com.smoo.backend.profile.dto.ProfileUpdateRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/profiles")
@RequiredArgsConstructor
public class ProfileController {

    private final ProfileService profileService;

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<ProfileResponse>> getProfile(Authentication authentication) {
        UUID userId = UUID.fromString(authentication.getName());
        ProfileResponse response = profileService.getProfile(userId);
        return ResponseEntity.ok(ApiResponse.success(SuccessCode.COMMON_SUCCESS, response));
    }

    @PatchMapping("/me")
    public ResponseEntity<ApiResponse<ProfileResponse>> updateProfile(
            Authentication authentication,
            @RequestBody ProfileUpdateRequest request) {
        UUID userId = UUID.fromString(authentication.getName());
        ProfileResponse response = profileService.updateProfile(userId, request);
        return ResponseEntity.ok(ApiResponse.success(SuccessCode.UPDATED, response));
    }

    @GetMapping("/me/overview")
    public ResponseEntity<ApiResponse<ProfileOverviewResponse>> getProfileOverview(Authentication authentication) {
        UUID userId = UUID.fromString(authentication.getName());
        ProfileOverviewResponse response = profileService.getProfileOverview(userId);
        return ResponseEntity.ok(ApiResponse.success(SuccessCode.COMMON_SUCCESS, response));
    }
}