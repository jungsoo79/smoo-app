package com.smoo.backend.settings.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class PushPreferencesResponse {

    private Boolean allPush;
    private Boolean schedulePush;
    private Boolean todoPush;
    private Boolean servicePush;
}
