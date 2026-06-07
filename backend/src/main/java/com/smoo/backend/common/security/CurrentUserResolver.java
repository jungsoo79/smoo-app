package com.smoo.backend.common.security;

import com.smoo.backend.common.exception.CustomException;
import com.smoo.backend.common.exception.ErrorCode;
import org.springframework.security.core.Authentication;

import java.util.UUID;

public final class CurrentUserResolver {

    private CurrentUserResolver() {
    }

    public static UUID resolve(Authentication authentication) {
        if (authentication != null && authentication.isAuthenticated() && !"anonymousUser".equals(authentication.getName())) {
            return UUID.fromString(authentication.getName());
        }

        throw new CustomException(ErrorCode.UNAUTHORIZED);
    }
}
