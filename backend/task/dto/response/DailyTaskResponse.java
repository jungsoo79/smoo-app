
package com.smoo.backend.task.dto.response;

import java.time.LocalDate;
import java.util.List;

public class DailyTaskResponse {

    private LocalDate date;
    private List<TaskCategoryGroupResponse> categories;

    public DailyTaskResponse(LocalDate date, List<TaskCategoryGroupResponse> categories) {
        this.date = date;
        this.categories = categories;
    }

    public LocalDate getDate() {
        return date;
    }

    public List<TaskCategoryGroupResponse> getCategories() {
        return categories;
    }
}