package com.smoo.backend.home.dto.response;

import com.smoo.backend.home.domain.WidgetType;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

public class HomeDashboardResponse {

    private String userName;
    private LocalDate date;
    private String todayText;
    private List<HomeWidgetResponse> widgets;

    public HomeDashboardResponse(
            String userName,
            LocalDate date,
            String todayText,
            List<HomeWidgetResponse> widgets
    ) {
        this.userName = userName;
        this.date = date;
        this.todayText = todayText;
        this.widgets = widgets;
    }

    public String getUserName() {
        return userName;
    }

    public LocalDate getDate() {
        return date;
    }

    public String getTodayText() {
        return todayText;
    }

    public List<HomeWidgetResponse> getWidgets() {
        return widgets;
    }

    public static class HomeWidgetResponse {

        private Long widgetId;
        private WidgetType widgetType;
        private String displayName;
        private Integer displayOrder;
        private Map<String, Object> data;

        public HomeWidgetResponse(
                Long widgetId,
                WidgetType widgetType,
                String displayName,
                Integer displayOrder,
                Map<String, Object> data
        ) {
            this.widgetId = widgetId;
            this.widgetType = widgetType;
            this.displayName = displayName;
            this.displayOrder = displayOrder;
            this.data = data;
        }

        public Long getWidgetId() {
            return widgetId;
        }

        public WidgetType getWidgetType() {
            return widgetType;
        }

        public String getDisplayName() {
            return displayName;
        }

        public Integer getDisplayOrder() {
            return displayOrder;
        }

        public Map<String, Object> getData() {
            return data;
        }
    }
}