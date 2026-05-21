package com.smoo.backend.common.security;

public record AuthenticatedUser(
        String supabaseUserId,
        String email
) {
}