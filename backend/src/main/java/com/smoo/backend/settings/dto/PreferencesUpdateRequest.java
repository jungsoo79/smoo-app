package com.smoo.backend.settings.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class PreferencesUpdateRequest {

    private String theme;
    private String language;
}