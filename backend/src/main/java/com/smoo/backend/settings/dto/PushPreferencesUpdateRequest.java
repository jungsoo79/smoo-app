package com.smoo.backend.settings.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class PushPreferencesUpdateRequest {

    private Boolean allPush;
    private Boolean schedulePush;
    private Boolean todoPush;
    private Boolean servicePush;
}
