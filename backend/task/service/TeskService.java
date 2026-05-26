package com.smoo.backend.task.service;

import com.smoo.backend.common.exception.CustomException;
import com.smoo.backend.common.exception.ErrorCode;
import com.smoo.backend.task.domain.Task;
import com.smoo.backend.task.domain.TaskCategory;
import com.smoo.backend.task.domain.TaskStatus;
import com.smoo.backend.task.dto.request.*;
import com.smoo.backend.task.dto.response.*;
import com.smoo.backend.task.repository.TaskCategoryRepository;
import com.smoo.backend.task.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TaskService {

    private final TaskRepository taskRepository;
    private final TaskCategoryRepository taskCategoryRepository;

    public DailyTaskResponse getTasksByDate(UUID userId, LocalDate date) {
        List<Task> tasks = taskRepository
                .findByUserIdAndDueDateAndDeletedAtIsNullOrderByCategoryIdAscSortOrderAscCreatedAtAsc(userId, date);

        Map<Long, List<TaskResponse>> grouped = new LinkedHashMap<>();

        for (Task task : tasks) {
            Long categoryId = task.getCategoryId();
            grouped.computeIfAbsent(categoryId, key -> new ArrayList<>())
                    .add(toTaskResponse(task));
        }

        List<TaskCategoryGroupResponse> categories = grouped.entrySet()
                .stream()
                .map(entry -> {
                    Long categoryId = entry.getKey();
                    TaskCategory category = getCategoryOrNull(userId, categoryId);

                    return new TaskCategoryGroupResponse(
                            categoryId,
                            category != null ? category.getName() : "없음",
                            category != null ? category.getColor() : "#999999",
                            entry.getValue()
                    );
                })
                .toList();

        return new DailyTaskResponse(date, categories);
    }

    public TaskResponse getTask(UUID userId, Long taskId) {
        Task task = getTaskOrThrow(userId, taskId);
        return toTaskResponse(task);
    }

    @Transactional
    public TaskResponse createTask(UUID userId, TaskCreateRequest request) {
        validateCategory(userId, request.getCategoryId());

        Integer maxSortOrder = taskRepository.findMaxSortOrderByUserIdAndDueDate(
                userId,
                request.getDueDate()
        );

        Task task = Task.create(
                userId,
                request.getTitle(),
                request.getMemo(),
                request.getDueDate(),
                request.getCategoryId(),
                maxSortOrder + 1
        );

        Task savedTask = taskRepository.save(task);

        return toTaskResponse(savedTask);
    }

    @Transactional
    public TaskResponse updateTask(UUID userId, Long taskId, TaskUpdateRequest request) {
        Task task = getTaskOrThrow(userId, taskId);
        validateCategory(userId, request.getCategoryId());

        task.update(
                request.getTitle(),
                request.getMemo(),
                request.getDueDate(),
                request.getCategoryId()
        );

        return toTaskResponse(task);
    }

    @Transactional
    public void deleteTask(UUID userId, Long taskId) {
        Task task = getTaskOrThrow(userId, taskId);
        task.delete();
    }

    @Transactional
    public TaskResponse completeTask(UUID userId, Long taskId) {
        Task task = getTaskOrThrow(userId, taskId);
        task.complete();

        return toTaskResponse(task);
    }

    @Transactional
    public TaskResponse incompleteTask(UUID userId, Long taskId) {
        Task task = getTaskOrThrow(userId, taskId);
        task.incomplete();

        return toTaskResponse(task);
    }

    @Transactional
    public DailyTaskResponse reorderTasks(UUID userId, TaskReorderRequest request) {
        for (TaskOrderRequest order : request.getOrders()) {
            Task task = getTaskOrThrow(userId, order.getTaskId());

            if (!request.getDate().equals(task.getDueDate())) {
                throw new CustomException(ErrorCode.INVALID_REQUEST, "해당 날짜의 할 일만 정렬할 수 있습니다.");
            }

            task.updateSortOrder(order.getSortOrder());
        }

        return getTasksByDate(userId, request.getDate());
    }

    public List<TaskCategoryResponse> getCategories(UUID userId) {
        return taskCategoryRepository.findByUserIdOrderByCreatedAtAsc(userId)
                .stream()
                .map(this::toCategoryResponse)
                .toList();
    }

    @Transactional
    public TaskCategoryResponse createCategory(UUID userId, TaskCategoryCreateRequest request) {
        TaskCategory category = TaskCategory.create(
                userId,
                request.getName(),
                request.getColor(),
                false
        );

        TaskCategory savedCategory = taskCategoryRepository.save(category);

        return toCategoryResponse(savedCategory);
    }

    @Transactional
    public TaskCategoryResponse updateCategory(UUID userId, Long categoryId, TaskCategoryUpdateRequest request) {
        TaskCategory category = taskCategoryRepository.findByIdAndUserId(categoryId, userId)
                .orElseThrow(() -> new CustomException(ErrorCode.RESOURCE_NOT_FOUND, "할 일 카테고리를 찾을 수 없습니다."));

        category.update(request.getName(), request.getColor());

        return toCategoryResponse(category);
    }

    @Transactional
    public void deleteCategory(UUID userId, Long categoryId) {
        TaskCategory category = taskCategoryRepository.findByIdAndUserId(categoryId, userId)
                .orElseThrow(() -> new CustomException(ErrorCode.RESOURCE_NOT_FOUND, "할 일 카테고리를 찾을 수 없습니다."));

        taskCategoryRepository.delete(category);
    }

    private Task getTaskOrThrow(UUID userId, Long taskId) {
        return taskRepository.findByIdAndUserIdAndDeletedAtIsNull(taskId, userId)
                .orElseThrow(() -> new CustomException(ErrorCode.RESOURCE_NOT_FOUND, "할 일을 찾을 수 없습니다."));
    }

    private void validateCategory(UUID userId, Long categoryId) {
        if (categoryId == null) {
            return;
        }

        taskCategoryRepository.findByIdAndUserId(categoryId, userId)
                .orElseThrow(() -> new CustomException(ErrorCode.RESOURCE_NOT_FOUND, "할 일 카테고리를 찾을 수 없습니다."));
    }

    private TaskResponse toTaskResponse(Task task) {
        TaskCategory category = getCategoryOrNull(task.getUserId(), task.getCategoryId());

        return new TaskResponse(
                task.getId(),
                task.getTitle(),
                task.getMemo(),
                task.getStatus(),
                task.getStatus() == TaskStatus.completed,
                task.getDueDate(),
                task.getCategoryId(),
                category != null ? category.getName() : null,
                category != null ? category.getColor() : null,
                task.getSortOrder(),
                task.getCompletedAt()
        );
    }

    private TaskCategory getCategoryOrNull(UUID userId, Long categoryId) {
        if (categoryId == null) {
            return null;
        }

        return taskCategoryRepository.findByIdAndUserId(categoryId, userId)
                .orElse(null);
    }

    private TaskCategoryResponse toCategoryResponse(TaskCategory category) {
        return new TaskCategoryResponse(
                category.getId(),
                category.getName(),
                category.getColor(),
                category.getIsDefault()
        );
    }
}