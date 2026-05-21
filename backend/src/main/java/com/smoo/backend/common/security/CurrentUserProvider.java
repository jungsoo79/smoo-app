package com.smoo.backend.common.security;

import com.smoo.backend.common.exception.CustomException;
import com.smoo.backend.common.exception.ErrorCode;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component
public class CurrentUserProvider {

    public AuthenticatedUser getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            throw new CustomException(ErrorCode.UNAUTHORIZED);
        }

        Object principal = authentication.getPrincipal();

        if (!(principal instanceof AuthenticatedUser authenticatedUser)) {
            throw new CustomException(ErrorCode.AUTH_USER_NOT_FOUND);
        }

        return authenticatedUser;
    }

    public String getCurrentUserId() {
        return getCurrentUser().supabaseUserId();
    }

    public String getCurrentUserEmail() {
        return getCurrentUser().email();
    }
}