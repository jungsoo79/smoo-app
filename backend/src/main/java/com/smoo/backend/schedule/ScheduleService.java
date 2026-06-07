package com.smoo.backend.schedule;

import com.smoo.backend.common.exception.CustomException;
import com.smoo.backend.common.exception.ErrorCode;
import com.smoo.backend.schedule.dto.ScheduleCreateRequest;
import com.smoo.backend.schedule.dto.ScheduleResponse;
import com.smoo.backend.schedule.dto.ScheduleUpdateRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ScheduleService {

    private final ScheduleRepository scheduleRepository;

    // 일정 생성
    @Transactional
    public ScheduleResponse createSchedule(UUID userId, ScheduleCreateRequest request) {
        Schedule schedule = new Schedule();
        schedule.setUserId(userId);
        schedule.setTitle(request.getTitle());
        schedule.setDescription(request.getDescription());
        schedule.setStartAt(request.getStartAt());
        schedule.setEndAt(request.getEndAt());
        schedule.setLocation(request.getLocation());
        schedule.setIsAllDay(request.getIsAllDay() != null ? request.getIsAllDay() : false);
        schedule.setCategoryName(request.getCategoryName());
        schedule.setCategoryColor(request.getCategoryColor());
        schedule.setCreatedAt(OffsetDateTime.now());
        schedule.setUpdatedAt(OffsetDateTime.now());

        scheduleRepository.save(schedule);
        return toResponse(schedule);
    }

    // 일정 상세 조회
    public ScheduleResponse getSchedule(UUID userId, Long scheduleId) {
        Schedule schedule = scheduleRepository.findByIdAndUserId(scheduleId, userId)
                .orElseThrow(() -> new CustomException(ErrorCode.SCHEDULE_NOT_FOUND));
        return toResponse(schedule);
    }

    // 일정 수정
    @Transactional
    public ScheduleResponse updateSchedule(UUID userId, Long scheduleId, ScheduleUpdateRequest request) {
        Schedule schedule = scheduleRepository.findByIdAndUserId(scheduleId, userId)
                .orElseThrow(() -> new CustomException(ErrorCode.SCHEDULE_NOT_FOUND));

        if (request.getTitle() != null) schedule.setTitle(request.getTitle());
        if (request.getDescription() != null) schedule.setDescription(request.getDescription());
        if (request.getStartAt() != null) schedule.setStartAt(request.getStartAt());
        if (request.getEndAt() != null) schedule.setEndAt(request.getEndAt());
        if (request.getLocation() != null) schedule.setLocation(request.getLocation());
        if (request.getIsAllDay() != null) schedule.setIsAllDay(request.getIsAllDay());
        if (request.getCategoryName() != null) schedule.setCategoryName(request.getCategoryName());
        if (request.getCategoryColor() != null) schedule.setCategoryColor(request.getCategoryColor());
        schedule.setUpdatedAt(OffsetDateTime.now());

        scheduleRepository.save(schedule);
        return toResponse(schedule);
    }

    // 일정 삭제
    @Transactional
    public void deleteSchedule(UUID userId, Long scheduleId) {
        Schedule schedule = scheduleRepository.findByIdAndUserId(scheduleId, userId)
                .orElseThrow(() -> new CustomException(ErrorCode.SCHEDULE_NOT_FOUND));
        scheduleRepository.delete(schedule);
    }

    // 날짜별 일정 조회
    public List<ScheduleResponse> getSchedulesByDate(UUID userId, String date) {
        return scheduleRepository.findByUserIdAndDate(userId, date)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    // 월별 일정 조회
    public List<ScheduleResponse> getSchedulesByMonth(UUID userId, int year, int month) {
        return scheduleRepository.findByUserIdAndYearAndMonth(userId, year, month)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    private ScheduleResponse toResponse(Schedule schedule) {
        return new ScheduleResponse(
                schedule.getId(),
                schedule.getTitle(),
                schedule.getDescription(),
                schedule.getStartAt(),
                schedule.getEndAt(),
                schedule.getLocation(),
                schedule.getIsAllDay(),
                schedule.getCategoryName(),
                schedule.getCategoryColor(),
                schedule.getCreatedAt(),
                schedule.getUpdatedAt()
        );
    }

    public List<ScheduleResponse> getSchedules(UUID userId, String date, Integer year, Integer month) {
        if (date != null) {
            return getSchedulesByDate(userId, date);
        } else if (year != null && month != null) {
            return getSchedulesByMonth(userId, year, month);
        } else {
            return scheduleRepository.findByUserIdOrderByStartAtAsc(userId)
                    .stream().map(this::toResponse).collect(Collectors.toList());
        }
    }
}
