package com.smoo.backend.home.service;

import com.smoo.backend.common.exception.CustomException;
import com.smoo.backend.common.exception.ErrorCode;
import com.smoo.backend.home.domain.DashboardWidget;
import com.smoo.backend.home.domain.WidgetType;
import com.smoo.backend.home.dto.request.WidgetCreateRequest;
import com.smoo.backend.home.dto.request.WidgetOrderRequest;
import com.smoo.backend.home.dto.request.WidgetReorderRequest;
import com.smoo.backend.home.dto.response.AvailableWidgetResponse;
import com.smoo.backend.home.dto.response.DashboardWidgetResponse;
import com.smoo.backend.home.dto.response.HomeDashboardResponse;
import com.smoo.backend.home.repository.DashboardWidgetRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Date;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.*;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class HomeService {

    private final DashboardWidgetRepository dashboardWidgetRepository;
    private final JdbcTemplate jdbcTemplate;

    public HomeDashboardResponse getDashboard(UUID userId, LocalDate date) {
        String userName = getUserName(userId);

        List<HomeDashboardResponse.HomeWidgetResponse> widgets = dashboardWidgetRepository
                .findByUserIdAndEnabledTrueOrderByDisplayOrderAscIdAsc(userId)
                .stream()
                .map(widget -> new HomeDashboardResponse.HomeWidgetResponse(
                        widget.getId(),
                        widget.getWidgetType(),
                        getDisplayName(widget.getWidgetType()),
                        widget.getDisplayOrder(),
                        buildWidgetData(userId, date, widget.getWidgetType())
                ))
                .toList();

        return new HomeDashboardResponse(
                userName,
                date,
                makeTodayText(date),
                widgets
        );
    }

    public List<DashboardWidgetResponse> getWidgets(UUID userId) {
        return dashboardWidgetRepository.findByUserIdOrderByDisplayOrderAscIdAsc(userId)
                .stream()
                .map(this::toWidgetResponse)
                .toList();
    }

    public List<AvailableWidgetResponse> getAvailableWidgets(UUID userId) {
        List<DashboardWidget> userWidgets = dashboardWidgetRepository.findByUserIdOrderByDisplayOrderAscIdAsc(userId);

        Set<WidgetType> addedTypes = new HashSet<>();
        for (DashboardWidget widget : userWidgets) {
            if (Boolean.TRUE.equals(widget.getEnabled())) {
                addedTypes.add(widget.getWidgetType());
            }
        }

        return Arrays.stream(WidgetType.values())
                .map(widgetType -> new AvailableWidgetResponse(
                        widgetType,
                        getDisplayName(widgetType),
                        addedTypes.contains(widgetType)
                ))
                .toList();
    }

    @Transactional
    public DashboardWidgetResponse createWidget(UUID userId, WidgetCreateRequest request) {
        Optional<DashboardWidget> existingWidget = dashboardWidgetRepository
                .findByUserIdAndWidgetType(userId, request.getWidgetType());

        if (existingWidget.isPresent()) {
            DashboardWidget widget = existingWidget.get();

            if (Boolean.TRUE.equals(widget.getEnabled())) {
                throw new CustomException(ErrorCode.INVALID_REQUEST, "이미 추가된 위젯입니다.");
            }

            widget.enable();
            return toWidgetResponse(widget);
        }

        Integer maxDisplayOrder = dashboardWidgetRepository.findMaxDisplayOrderByUserId(userId);

        DashboardWidget widget = DashboardWidget.create(
                userId,
                request.getWidgetType(),
                maxDisplayOrder + 1
        );

        DashboardWidget savedWidget = dashboardWidgetRepository.save(widget);

        return toWidgetResponse(savedWidget);
    }

    @Transactional
    public void deleteWidget(UUID userId, Long widgetId) {
        DashboardWidget widget = dashboardWidgetRepository.findByIdAndUserId(widgetId, userId)
                .orElseThrow(() -> new CustomException(ErrorCode.RESOURCE_NOT_FOUND, "위젯을 찾을 수 없습니다."));

        widget.disable();
    }

    @Transactional
    public List<DashboardWidgetResponse> reorderWidgets(UUID userId, WidgetReorderRequest request) {
        for (WidgetOrderRequest order : request.getOrders()) {
            DashboardWidget widget = dashboardWidgetRepository.findByIdAndUserId(order.getWidgetId(), userId)
                    .orElseThrow(() -> new CustomException(ErrorCode.RESOURCE_NOT_FOUND, "위젯을 찾을 수 없습니다."));

            widget.updateDisplayOrder(order.getDisplayOrder());
        }

        return getWidgets(userId);
    }

    private DashboardWidgetResponse toWidgetResponse(DashboardWidget widget) {
        return new DashboardWidgetResponse(
                widget.getId(),
                widget.getWidgetType(),
                getDisplayName(widget.getWidgetType()),
                widget.getDisplayOrder(),
                widget.getEnabled()
        );
    }

    private Map<String, Object> buildWidgetData(UUID userId, LocalDate date, WidgetType widgetType) {
        try {
            return switch (widgetType) {
                case TODO -> buildTodoWidgetData(userId, date);
                case SCHEDULE -> buildScheduleWidgetData(userId, date);
                case MEMO -> buildMemoWidgetData(userId);
                case LEDGER -> buildLedgerWidgetData(userId, date);
                case CALENDAR -> buildCalendarWidgetData(userId, date);
            };
        } catch (DataAccessException e) {
            return Map.of(
                    "items", List.of(),
                    "message", "해당 위젯 데이터 테이블이 아직 준비되지 않았습니다."
            );
        }
    }

    private Map<String, Object> buildTodoWidgetData(UUID userId, LocalDate date) {
        Integer totalCount = queryForInteger("""
            SELECT COUNT(*)
            FROM public.tasks
            WHERE user_id = ?
              AND due_date = ?
              AND deleted_at IS NULL
        """, userId, Date.valueOf(date));

        Integer completedCount = queryForInteger("""
            SELECT COUNT(*)
            FROM public.tasks
            WHERE user_id = ?
              AND due_date = ?
              AND status = 'completed'
              AND deleted_at IS NULL
        """, userId, Date.valueOf(date));

        List<Map<String, Object>> items = jdbcTemplate.queryForList("""
            SELECT id, title, description, status
            FROM public.tasks
            WHERE user_id = ?
              AND due_date = ?
              AND deleted_at IS NULL
            ORDER BY sort_order ASC, created_at ASC
            LIMIT 3
        """, userId, Date.valueOf(date));

        return Map.of(
                "totalCount", totalCount,
                "completedCount", completedCount,
                "items", items
        );
    }

    private Map<String, Object> buildScheduleWidgetData(UUID userId, LocalDate date) {
        List<Map<String, Object>> items = jdbcTemplate.queryForList("""
            SELECT
                id,
                title,
                description,
                TO_CHAR(start_at, 'HH24:MI') AS time
            FROM public.schedules
            WHERE user_id = ?
              AND DATE(start_at) = ?
            ORDER BY start_at ASC
            LIMIT 3
        """, userId, Date.valueOf(date));

        return Map.of(
                "items", items
        );
    }

    private Map<String, Object> buildMemoWidgetData(UUID userId) {
        List<Map<String, Object>> items = jdbcTemplate.queryForList("""
            SELECT
                id,
                title,
                CASE
                    WHEN content IS NULL THEN ''
                    WHEN LENGTH(content) <= 60 THEN content
                    ELSE SUBSTRING(content FROM 1 FOR 60) || '...'
                END AS preview,
                updated_at
            FROM public.memos
            WHERE user_id = ?
              AND deleted_at IS NULL
            ORDER BY pinned DESC, updated_at DESC
            LIMIT 2
        """, userId);

        return Map.of(
                "items", items
        );
    }

    private Map<String, Object> buildLedgerWidgetData(UUID userId, LocalDate date) {
        YearMonth yearMonth = YearMonth.from(date);
        LocalDate startDate = yearMonth.atDay(1);
        LocalDate endDate = yearMonth.atEndOfMonth();

        Long initialBalance = queryForLong("""
            SELECT COALESCE(MAX(initial_balance), 0)
            FROM public.ledger_books
            WHERE user_id = ?
        """, userId);

        Long totalIncome = queryForLong("""
            SELECT COALESCE(SUM(amount), 0)
            FROM public.ledger_transactions
            WHERE user_id = ?
              AND type = 'INCOME'
        """, userId);

        Long totalExpense = queryForLong("""
            SELECT COALESCE(SUM(amount), 0)
            FROM public.ledger_transactions
            WHERE user_id = ?
              AND type = 'EXPENSE'
        """, userId);

        Long monthlyIncome = queryForLong("""
            SELECT COALESCE(SUM(amount), 0)
            FROM public.ledger_transactions
            WHERE user_id = ?
              AND type = 'INCOME'
              AND transaction_date BETWEEN ? AND ?
        """, userId, Date.valueOf(startDate), Date.valueOf(endDate));

        Long monthlyExpense = queryForLong("""
            SELECT COALESCE(SUM(amount), 0)
            FROM public.ledger_transactions
            WHERE user_id = ?
              AND type = 'EXPENSE'
              AND transaction_date BETWEEN ? AND ?
        """, userId, Date.valueOf(startDate), Date.valueOf(endDate));

        Long currentBalance = initialBalance + totalIncome - totalExpense;

        return Map.of(
                "currentBalance", currentBalance,
                "monthlyIncome", monthlyIncome,
                "monthlyExpense", monthlyExpense
        );
    }

    private Map<String, Object> buildCalendarWidgetData(UUID userId, LocalDate date) {
        YearMonth yearMonth = YearMonth.from(date);
        LocalDate startDate = yearMonth.atDay(1);
        LocalDate endDate = yearMonth.atEndOfMonth();

        List<Map<String, Object>> days = jdbcTemplate.queryForList("""
            SELECT
                DATE(start_at) AS date,
                COUNT(*) AS scheduleCount
            FROM public.schedules
            WHERE user_id = ?
              AND DATE(start_at) BETWEEN ? AND ?
            GROUP BY DATE(start_at)
            ORDER BY DATE(start_at)
        """, userId, Date.valueOf(startDate), Date.valueOf(endDate));

        return Map.of(
                "year", yearMonth.getYear(),
                "month", yearMonth.getMonthValue(),
                "days", days
        );
    }

    private String getUserName(UUID userId) {
        try {
            String name = jdbcTemplate.queryForObject("""
                SELECT name
                FROM public.profiles
                WHERE id = ?
            """, String.class, userId);

            return name != null ? name : "사용자";
        } catch (DataAccessException e) {
            return "사용자";
        }
    }

    private Integer queryForInteger(String sql, Object... args) {
        Integer value = jdbcTemplate.queryForObject(sql, Integer.class, args);
        return value != null ? value : 0;
    }

    private Long queryForLong(String sql, Object... args) {
        Long value = jdbcTemplate.queryForObject(sql, Long.class, args);
        return value != null ? value : 0L;
    }

    private String getDisplayName(WidgetType widgetType) {
        return switch (widgetType) {
            case TODO -> "투두";
            case SCHEDULE -> "일정";
            case MEMO -> "메모";
            case LEDGER -> "가계부";
            case CALENDAR -> "캘린더";
        };
    }

    private String makeTodayText(LocalDate date) {
        String dayOfWeek = getKoreanDayOfWeek(date.getDayOfWeek());

        return "오늘은 "
                + date.getMonthValue()
                + "월 "
                + date.getDayOfMonth()
                + "일 "
                + dayOfWeek
                + "요일입니다.";
    }

    private String getKoreanDayOfWeek(DayOfWeek dayOfWeek) {
        return switch (dayOfWeek) {
            case MONDAY -> "월";
            case TUESDAY -> "화";
            case WEDNESDAY -> "수";
            case THURSDAY -> "목";
            case FRIDAY -> "금";
            case SATURDAY -> "토";
            case SUNDAY -> "일";
        };
    }
}