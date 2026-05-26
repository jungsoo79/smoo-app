package com.smoo.backend.schedule;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ScheduleRepository extends JpaRepository<Schedule, Long> {

    // 일정 상세 조회
    Optional<Schedule> findByIdAndUserId(Long id, UUID userId);

    // 날짜별 일정 조회
    @Query(value = "SELECT * FROM schedules WHERE user_id = :userId AND DATE(start_at AT TIME ZONE 'Asia/Seoul') = CAST(:date AS date)", nativeQuery = true)
    List<Schedule> findByUserIdAndDate(@Param("userId") UUID userId, @Param("date") String date);

    // 월별 일정 조회
    @Query(value = "SELECT * FROM schedules WHERE user_id = :userId AND EXTRACT(YEAR FROM start_at AT TIME ZONE 'Asia/Seoul') = :year AND EXTRACT(MONTH FROM start_at AT TIME ZONE 'Asia/Seoul') = :month", nativeQuery = true)
    List<Schedule> findByUserIdAndYearAndMonth(@Param("userId") UUID userId, @Param("year") int year, @Param("month") int month);
}