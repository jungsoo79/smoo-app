package com.smoo.backend.task.controller;

import com.smoo.backend.common.response.ApiResponse;
import com.smoo.backend.common.response.SuccessCode;
import com.smoo.backend.task.dto.request.*;
import com.smoo.backend.task.dto.response.*;
import com.smoo.backend.task.service.TaskService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
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
            @RequestHeader("X-USER-ID") UUID userId,
            @RequestParam("date") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date
    ) {
        DailyTaskResponse response = taskService.getTasksByDate(userId, date);

        return ResponseEntity
                .status(SuccessCode.COMMON_SUCCESS.getHttpStatus())
                .body(ApiResponse.success(SuccessCode.COMMON_SUCCESS, response));
    }

    @GetMapping("/{taskId}")
    public ResponseEntity<ApiResponse<TaskResponse>> getTask(
            @RequestHeader("X-USER-ID") UUID userId,
            @PathVariable Long taskId
    ) {
        TaskResponse response = taskService.getTask(userId, taskId);

        return ResponseEntity
                .status(SuccessCode.COMMON_SUCCESS.getHttpStatus())
                .body(ApiResponse.success(SuccessCode.COMMON_SUCCESS, response));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<TaskResponse>> createTask(
            @RequestHeader("X-USER-ID") UUID userId,
            @Valid @RequestBody TaskCreateRequest request
    ) {
        TaskResponse response = taskService.createTask(userId, request);

        return ResponseEntity
                .status(SuccessCode.CREATED.getHttpStatus())
                .body(ApiResponse.success(SuccessCode.CREATED, response));
    }

    @PatchMapping("/{taskId}")
    public ResponseEntity<ApiResponse<TaskResponse>> updateTask(
            @RequestHeader("X-USER-ID") UUID userId,
            @PathVariable Long taskId,
            @Valid @RequestBody TaskUpdateRequest request
    ) {
        TaskResponse response = taskService.updateTask(userId, taskId, request);

        return ResponseEntity
                .status(SuccessCode.UPDATED.getHttpStatus())
                .body(ApiResponse.success(SuccessCode.UPDATED, response));
    }

    @DeleteMapping("/{taskId}")
    public ResponseEntity<ApiResponse<Void>> deleteTask(
            @RequestHeader("X-USER-ID") UUID userId,
            @PathVariable Long taskId
    ) {
        taskService.deleteTask(userId, taskId);

        return ResponseEntity
                .status(SuccessCode.DELETED.getHttpStatus())
                .body(ApiResponse.success(SuccessCode.DELETED));
    }

    @PatchMapping("/{taskId}/complete")
    public ResponseEntity<ApiResponse<TaskResponse>> completeTask(
            @RequestHeader("X-USER-ID") UUID userId,
            @PathVariable Long taskId
    ) {
        TaskResponse response = taskService.completeTask(userId, taskId);

        return ResponseEntity
                .status(SuccessCode.UPDATED.getHttpStatus())
                .body(ApiResponse.success(SuccessCode.UPDATED, response));
    }

    @PatchMapping("/{taskId}/incomplete")
    public ResponseEntity<ApiResponse<TaskResponse>> incompleteTask(
            @RequestHeader("X-USER-ID") UUID userId,
            @PathVariable Long taskId
    ) {
        TaskResponse response = taskService.incompleteTask(userId, taskId);

        return ResponseEntity
                .status(SuccessCode.UPDATED.getHttpStatus())
                .body(ApiResponse.success(SuccessCode.UPDATED, response));
    }

    @PatchMapping("/reorder")
    public ResponseEntity<ApiResponse<DailyTaskResponse>> reorderTasks(
            @RequestHeader("X-USER-ID") UUID userId,
            @Valid @RequestBody TaskReorderRequest request
    ) {
        DailyTaskResponse response = taskService.reorderTasks(userId, request);

        return ResponseEntity
                .status(SuccessCode.UPDATED.getHttpStatus())
                .body(ApiResponse.success(SuccessCode.UPDATED, response));
    }

    @GetMapping("/categories")
    public ResponseEntity<ApiResponse<List<TaskCategoryResponse>>> getCategories(
            @RequestHeader("X-USER-ID") UUID userId
    ) {
        List<TaskCategoryResponse> response = taskService.getCategories(userId);

        return ResponseEntity
                .status(SuccessCode.COMMON_SUCCESS.getHttpStatus())
                .body(ApiResponse.success(SuccessCode.COMMON_SUCCESS, response));
    }

    @PostMapping("/categories")
    public ResponseEntity<ApiResponse<TaskCategoryResponse>> createCategory(
            @RequestHeader("X-USER-ID") UUID userId,
            @Valid @RequestBody TaskCategoryCreateRequest request
    ) {
        TaskCategoryResponse response = taskService.createCategory(userId, request);

        return ResponseEntity
                .status(SuccessCode.CREATED.getHttpStatus())
                .body(ApiResponse.success(SuccessCode.CREATED, response));
    }

    @PatchMapping("/categories/{categoryId}")
    public ResponseEntity<ApiResponse<TaskCategoryResponse>> updateCategory(
            @RequestHeader("X-USER-ID") UUID userId,
            @PathVariable Long categoryId,
            @Valid @RequestBody TaskCategoryUpdateRequest request
    ) {
        TaskCategoryResponse response = taskService.updateCategory(userId, categoryId, request);

        return ResponseEntity
                .status(SuccessCode.UPDATED.getHttpStatus())
                .body(ApiResponse.success(SuccessCode.UPDATED, response));
    }

    @DeleteMapping("/categories/{categoryId}")
    public ResponseEntity<ApiResponse<Void>> deleteCategory(
            @RequestHeader("X-USER-ID") UUID userId,
            @PathVariable Long categoryId
    ) {
        taskService.deleteCategory(userId, categoryId);

        return ResponseEntity
                .status(SuccessCode.DELETED.getHttpStatus())
                .body(ApiResponse.success(SuccessCode.DELETED));
    }
}