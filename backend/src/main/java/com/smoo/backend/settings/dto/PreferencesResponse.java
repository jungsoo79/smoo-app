package com.smoo.backend.settings.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class PreferencesResponse {

    private String theme;
    private String language;
}