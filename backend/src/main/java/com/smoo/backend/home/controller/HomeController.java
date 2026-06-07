package com.smoo.backend.home.controller;

import com.smoo.backend.common.security.CurrentUserResolver;
import com.smoo.backend.common.response.ApiResponse;
import com.smoo.backend.common.response.SuccessCode;
import com.smoo.backend.home.dto.request.WidgetCreateRequest;
import com.smoo.backend.home.dto.request.WidgetReorderRequest;
import com.smoo.backend.home.dto.response.AvailableWidgetResponse;
import com.smoo.backend.home.dto.response.DashboardWidgetResponse;
import com.smoo.backend.home.dto.response.HomeDashboardResponse;
import com.smoo.backend.home.service.HomeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/home")
public class HomeController {

    private final HomeService homeService;

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<HomeDashboardResponse>> getDashboard(
            Authentication authentication,
            @RequestParam("date") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date
    ) {
        UUID userId = CurrentUserResolver.resolve(authentication);
        HomeDashboardResponse response = homeService.getDashboard(userId, date);

        return ResponseEntity
                .status(SuccessCode.COMMON_SUCCESS.getHttpStatus())
                .body(ApiResponse.success(SuccessCode.COMMON_SUCCESS, response));
    }

    @GetMapping("/widgets")
    public ResponseEntity<ApiResponse<List<DashboardWidgetResponse>>> getWidgets(
            Authentication authentication
    ) {
        UUID userId = CurrentUserResolver.resolve(authentication);
        List<DashboardWidgetResponse> response = homeService.getWidgets(userId);

        return ResponseEntity
                .status(SuccessCode.COMMON_SUCCESS.getHttpStatus())
                .body(ApiResponse.success(SuccessCode.COMMON_SUCCESS, response));
    }

    @GetMapping("/widgets/available")
    public ResponseEntity<ApiResponse<List<AvailableWidgetResponse>>> getAvailableWidgets(
            Authentication authentication
    ) {
        UUID userId = CurrentUserResolver.resolve(authentication);
        List<AvailableWidgetResponse> response = homeService.getAvailableWidgets(userId);

        return ResponseEntity
                .status(SuccessCode.COMMON_SUCCESS.getHttpStatus())
                .body(ApiResponse.success(SuccessCode.COMMON_SUCCESS, response));
    }

    @PostMapping("/widgets")
    public ResponseEntity<ApiResponse<DashboardWidgetResponse>> createWidget(
            Authentication authentication,
            @Valid @RequestBody WidgetCreateRequest request
    ) {
        UUID userId = CurrentUserResolver.resolve(authentication);
        DashboardWidgetResponse response = homeService.createWidget(userId, request);

        return ResponseEntity
                .status(SuccessCode.CREATED.getHttpStatus())
                .body(ApiResponse.success(SuccessCode.CREATED, response));
    }

    @DeleteMapping("/widgets/{widgetId}")
    public ResponseEntity<ApiResponse<Void>> deleteWidget(
            Authentication authentication,
            @PathVariable Long widgetId
    ) {
        UUID userId = CurrentUserResolver.resolve(authentication);
        homeService.deleteWidget(userId, widgetId);

        return ResponseEntity
                .status(SuccessCode.DELETED.getHttpStatus())
                .body(ApiResponse.success(SuccessCode.DELETED));
    }

    @PatchMapping("/widgets/reorder")
    public ResponseEntity<ApiResponse<List<DashboardWidgetResponse>>> reorderWidgets(
            Authentication authentication,
            @Valid @RequestBody WidgetReorderRequest request
    ) {
        UUID userId = CurrentUserResolver.resolve(authentication);
        List<DashboardWidgetResponse> response = homeService.reorderWidgets(userId, request);

        return ResponseEntity
                .status(SuccessCode.UPDATED.getHttpStatus())
                .body(ApiResponse.success(SuccessCode.UPDATED, response));
    }
}



