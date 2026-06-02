package com.smoo.backend.schedule;

import com.smoo.backend.common.response.ApiResponse;
import com.smoo.backend.common.response.SuccessCode;
import com.smoo.backend.schedule.dto.ScheduleCreateRequest;
import com.smoo.backend.schedule.dto.ScheduleResponse;
import com.smoo.backend.schedule.dto.ScheduleUpdateRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/schedules")
@RequiredArgsConstructor
public class ScheduleController {

    private final ScheduleService scheduleService;

    @PostMapping
    public ResponseEntity<ApiResponse<ScheduleResponse>> createSchedule(
            Authentication authentication,
            @Valid @RequestBody ScheduleCreateRequest request) {
        UUID userId = UUID.fromString(authentication.getName());
        ScheduleResponse response = scheduleService.createSchedule(userId, request);
        return ResponseEntity.status(201).body(ApiResponse.success(SuccessCode.CREATED, response));
    }

    @GetMapping("/{scheduleId}")
    public ResponseEntity<ApiResponse<ScheduleResponse>> getSchedule(
            Authentication authentication,
            @PathVariable Long scheduleId) {
        UUID userId = UUID.fromString(authentication.getName());
        ScheduleResponse response = scheduleService.getSchedule(userId, scheduleId);
        return ResponseEntity.ok(ApiResponse.success(SuccessCode.COMMON_SUCCESS, response));
    }

    @PatchMapping("/{scheduleId}")
    public ResponseEntity<ApiResponse<ScheduleResponse>> updateSchedule(
            Authentication authentication,
            @PathVariable Long scheduleId,
            @RequestBody ScheduleUpdateRequest request) {
        UUID userId = UUID.fromString(authentication.getName());
        ScheduleResponse response = scheduleService.updateSchedule(userId, scheduleId, request);
        return ResponseEntity.ok(ApiResponse.success(SuccessCode.UPDATED, response));
    }

    @DeleteMapping("/{scheduleId}")
    public ResponseEntity<ApiResponse<Void>> deleteSchedule(
            Authentication authentication,
            @PathVariable Long scheduleId) {
        UUID userId = UUID.fromString(authentication.getName());
        scheduleService.deleteSchedule(userId, scheduleId);
        return ResponseEntity.ok(ApiResponse.success(SuccessCode.DELETED));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ScheduleResponse>>> getSchedules(
            Authentication authentication,
            @RequestParam(required = false) String date,
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer month) {
        UUID userId = UUID.fromString(authentication.getName());
        List<ScheduleResponse> response = scheduleService.getSchedules(userId, date, year, month);
        return ResponseEntity.ok(ApiResponse.success(SuccessCode.COMMON_SUCCESS, response));
    }
}