package com.smoo.backend.common.security;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public record SupabaseUserResponse(
        String id,
        String email
) {
}