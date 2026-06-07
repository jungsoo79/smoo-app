package com.smoo.backend.task.controller;

import com.smoo.backend.common.response.ApiResponse;
import com.smoo.backend.common.response.SuccessCode;
import com.smoo.backend.common.security.CurrentUserResolver;
import com.smoo.backend.task.dto.request.*;
import com.smoo.backend.task.dto.response.*;
import com.smoo.backend.task.service.TaskService;
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
@RequestMapping("/api/tasks")
public class TaskController {

    private final TaskService taskService;

    @GetMapping
    public ResponseEntity<ApiResponse<DailyTaskResponse>> getTasksByDate(
            Authentication authentication,
            @RequestParam("date") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date
    ) {
        UUID userId = CurrentUserResolver.resolve(authentication);
        DailyTaskResponse response = taskService.getTasksByDate(userId, date);

        return ResponseEntity
                .status(SuccessCode.COMMON_SUCCESS.getHttpStatus())
                .body(ApiResponse.success(SuccessCode.COMMON_SUCCESS, response));
    }

    @GetMapping("/{taskId}")
    public ResponseEntity<ApiResponse<TaskResponse>> getTask(
            Authentication authentication,
            @PathVariable Long taskId
    ) {
        UUID userId = CurrentUserResolver.resolve(authentication);
        TaskResponse response = taskService.getTask(userId, taskId);

        return ResponseEntity
                .status(SuccessCode.COMMON_SUCCESS.getHttpStatus())
                .body(ApiResponse.success(SuccessCode.COMMON_SUCCESS, response));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<TaskResponse>> createTask(
            Authentication authentication,
            @Valid @RequestBody TaskCreateRequest request
    ) {
        UUID userId = CurrentUserResolver.resolve(authentication);
        TaskResponse response = taskService.createTask(userId, request);

        return ResponseEntity
                .status(SuccessCode.CREATED.getHttpStatus())
                .body(ApiResponse.success(SuccessCode.CREATED, response));
    }

    @PatchMapping("/{taskId}")
    public ResponseEntity<ApiResponse<TaskResponse>> updateTask(
            Authentication authentication,
            @PathVariable Long taskId,
            @Valid @RequestBody TaskUpdateRequest request
    ) {
        UUID userId = CurrentUserResolver.resolve(authentication);
        TaskResponse response = taskService.updateTask(userId, taskId, request);

        return ResponseEntity
                .status(SuccessCode.UPDATED.getHttpStatus())
                .body(ApiResponse.success(SuccessCode.UPDATED, response));
    }

    @DeleteMapping("/{taskId}")
    public ResponseEntity<ApiResponse<Void>> deleteTask(
            Authentication authentication,
            @PathVariable Long taskId
    ) {
        UUID userId = CurrentUserResolver.resolve(authentication);
        taskService.deleteTask(userId, taskId);

        return ResponseEntity
                .status(SuccessCode.DELETED.getHttpStatus())
                .body(ApiResponse.success(SuccessCode.DELETED));
    }

    @PatchMapping("/{taskId}/complete")
    public ResponseEntity<ApiResponse<TaskResponse>> completeTask(
            Authentication authentication,
            @PathVariable Long taskId
    ) {
        UUID userId = CurrentUserResolver.resolve(authentication);
        TaskResponse response = taskService.completeTask(userId, taskId);

        return ResponseEntity
                .status(SuccessCode.UPDATED.getHttpStatus())
                .body(ApiResponse.success(SuccessCode.UPDATED, response));
    }

    @PatchMapping("/{taskId}/incomplete")
    public ResponseEntity<ApiResponse<TaskResponse>> incompleteTask(
            Authentication authentication,
            @PathVariable Long taskId
    ) {
        UUID userId = CurrentUserResolver.resolve(authentication);
        TaskResponse response = taskService.incompleteTask(userId, taskId);

        return ResponseEntity
                .status(SuccessCode.UPDATED.getHttpStatus())
                .body(ApiResponse.success(SuccessCode.UPDATED, response));
    }

    @PatchMapping("/reorder")
    public ResponseEntity<ApiResponse<DailyTaskResponse>> reorderTasks(
            Authentication authentication,
            @Valid @RequestBody TaskReorderRequest request
    ) {
        UUID userId = CurrentUserResolver.resolve(authentication);
        DailyTaskResponse response = taskService.reorderTasks(userId, request);

        return ResponseEntity
                .status(SuccessCode.UPDATED.getHttpStatus())
                .body(ApiResponse.success(SuccessCode.UPDATED, response));
    }

    @GetMapping("/categories")
    public ResponseEntity<ApiResponse<List<TaskCategoryResponse>>> getCategories(
            Authentication authentication
    ) {
        UUID userId = CurrentUserResolver.resolve(authentication);
        List<TaskCategoryResponse> response = taskService.getCategories(userId);

        return ResponseEntity
                .status(SuccessCode.COMMON_SUCCESS.getHttpStatus())
                .body(ApiResponse.success(SuccessCode.COMMON_SUCCESS, response));
    }

    @PostMapping("/categories")
    public ResponseEntity<ApiResponse<TaskCategoryResponse>> createCategory(
            Authentication authentication,
            @Valid @RequestBody TaskCategoryCreateRequest request
    ) {
        UUID userId = CurrentUserResolver.resolve(authentication);
        TaskCategoryResponse response = taskService.createCategory(userId, request);

        return ResponseEntity
                .status(SuccessCode.CREATED.getHttpStatus())
                .body(ApiResponse.success(SuccessCode.CREATED, response));
    }

    @PatchMapping("/categories/{categoryId}")
    public ResponseEntity<ApiResponse<TaskCategoryResponse>> updateCategory(
            Authentication authentication,
            @PathVariable Long categoryId,
            @Valid @RequestBody TaskCategoryUpdateRequest request
    ) {
        UUID userId = CurrentUserResolver.resolve(authentication);
        TaskCategoryResponse response = taskService.updateCategory(userId, categoryId, request);

        return ResponseEntity
                .status(SuccessCode.UPDATED.getHttpStatus())
                .body(ApiResponse.success(SuccessCode.UPDATED, response));
    }

    @DeleteMapping("/categories/{categoryId}")
    public ResponseEntity<ApiResponse<Void>> deleteCategory(
            Authentication authentication,
            @PathVariable Long categoryId
    ) {
        UUID userId = CurrentUserResolver.resolve(authentication);
        taskService.deleteCategory(userId, categoryId);

        return ResponseEntity
                .status(SuccessCode.DELETED.getHttpStatus())
                .body(ApiResponse.success(SuccessCode.DELETED));
    }
}



