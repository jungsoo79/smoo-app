package com.smoo.backend.profile;

import com.smoo.backend.common.exception.CustomException;
import com.smoo.backend.common.exception.ErrorCode;
import com.smoo.backend.profile.dto.ProfileOverviewResponse;
import com.smoo.backend.profile.dto.ProfileResponse;
import com.smoo.backend.profile.dto.ProfileUpdateRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProfileService {

    private final ProfileRepository profileRepository;
    private final JdbcTemplate jdbcTemplate;

    public ProfileResponse getProfile(UUID userId) {
        Profile profile = profileRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.PROFILE_NOT_FOUND));

        return new ProfileResponse(
                profile.getName(),
                profile.getEmail(),
                profile.getAvatarUrl(),
                profile.getBio()
        );
    }

    @Transactional
    public ProfileResponse updateProfile(UUID userId, ProfileUpdateRequest request) {
        Profile profile = profileRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.PROFILE_NOT_FOUND));

        if (request.getName() != null) {
            profile.setName(request.getName());
        }
        if (request.getAvatarUrl() != null) {
            profile.setAvatarUrl(request.getAvatarUrl());
        }
        if (request.getBio() != null) {
            profile.setBio(request.getBio());
        }

        profileRepository.save(profile);

        return new ProfileResponse(
                profile.getName(),
                profile.getEmail(),
                profile.getAvatarUrl(),
                profile.getBio()
        );
    }

    public ProfileOverviewResponse getProfileOverview(UUID userId) {
        Profile profile = profileRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.PROFILE_NOT_FOUND));

        LocalDate today = LocalDate.now();
        LocalDate startOfWeek = today.with(DayOfWeek.MONDAY);
        LocalDate endOfWeek = today.with(DayOfWeek.SUNDAY);

        Long todayCompletedTaskCount = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM tasks WHERE user_id = ?::uuid AND DATE(completed_at) = ?",
                Long.class, userId.toString(), today);

        Long thisWeekScheduleCount = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM schedules WHERE user_id = ?::uuid AND DATE(start_at) BETWEEN ? AND ?",
                Long.class, userId.toString(), startOfWeek, endOfWeek);

        Long activeGoalCount = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM goals WHERE user_id = ?::uuid AND status = 'active'",
                Long.class, userId.toString());

        return new ProfileOverviewResponse(
                profile.getName(),
                profile.getEmail(),
                profile.getAvatarUrl(),
                todayCompletedTaskCount != null ? todayCompletedTaskCount : 0,
                thisWeekScheduleCount != null ? thisWeekScheduleCount : 0,
                activeGoalCount != null ? activeGoalCount : 0
        );
    }
}