package com.smoo.backend.common.exception;

import org.springframework.http.HttpStatus;

public enum ErrorCode {

    // Common
    INTERNAL_SERVER_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "INTERNAL_SERVER_ERROR", "서버 내부 오류가 발생했습니다."),
    INVALID_REQUEST(HttpStatus.BAD_REQUEST, "INVALID_REQUEST", "잘못된 요청입니다."),
    VALIDATION_ERROR(HttpStatus.BAD_REQUEST, "VALIDATION_ERROR", "입력값 검증에 실패했습니다."),


    // Auth
    UNAUTHORIZED(HttpStatus.UNAUTHORIZED, "UNAUTHORIZED", "인증이 필요합니다."),
    FORBIDDEN(HttpStatus.FORBIDDEN, "FORBIDDEN", "접근 권한이 없습니다."),
    LOGIN_FAILED(HttpStatus.UNAUTHORIZED, "LOGIN_FAILED", "로그인에 실패했습니다."),
    INVALID_CREDENTIALS(HttpStatus.UNAUTHORIZED, "INVALID_CREDENTIALS", "이메일 또는 비밀번호가 올바르지 않습니다."),
    EMAIL_NOT_CONFIRMED(HttpStatus.UNAUTHORIZED, "EMAIL_NOT_CONFIRMED", "이메일 인증 후 로그인해주세요."),
    INVALID_REFRESH_TOKEN(HttpStatus.UNAUTHORIZED, "INVALID_REFRESH_TOKEN", "유효하지 않은 리프레시 토큰입니다."),
    // Signup
    EMAIL_ALREADY_EXISTS(HttpStatus.CONFLICT, "EMAIL_ALREADY_EXISTS", "이미 사용 중인 이메일입니다."),
    WEAK_PASSWORD(HttpStatus.BAD_REQUEST, "WEAK_PASSWORD", "비밀번호가 너무 약합니다."),
    EMAIL_RATE_LIMIT(HttpStatus.TOO_MANY_REQUESTS, "EMAIL_RATE_LIMIT", "이메일 전송 한도를 초과했습니다."),
    INVALID_EMAIL(HttpStatus.BAD_REQUEST, "INVALID_EMAIL", "올바르지 않은 이메일 형식입니다."),
    SIGNUP_FAILED(HttpStatus.INTERNAL_SERVER_ERROR, "SIGNUP_FAILED", "회원가입에 실패했습니다."),
    // Logout
    LOGOUT_FAILED(HttpStatus.INTERNAL_SERVER_ERROR, "LOGOUT_FAILED", "로그아웃에 실패했습니다."),
    // Email Verify
    OTP_EXPIRED(HttpStatus.BAD_REQUEST, "OTP_EXPIRED", "인증 코드가 만료되었습니다."),
    OTP_INVALID(HttpStatus.BAD_REQUEST, "OTP_INVALID", "인증 코드가 올바르지 않습니다."),
    VERIFY_FAILED(HttpStatus.INTERNAL_SERVER_ERROR, "VERIFY_FAILED", "이메일 인증에 실패했습니다."),
    // Password
    PASSWORD_RESET_FAILED(HttpStatus.INTERNAL_SERVER_ERROR, "PASSWORD_RESET_FAILED", "비밀번호 재설정 코드 발송에 실패했습니다."),
    PASSWORD_UPDATE_FAILED(HttpStatus.INTERNAL_SERVER_ERROR, "PASSWORD_UPDATE_FAILED", "새 비밀번호 변경에 실패했습니다."),
    INVALID_CURRENT_PASSWORD(HttpStatus.UNAUTHORIZED, "INVALID_CURRENT_PASSWORD", "현재 비밀번호가 올바르지 않습니다."),

    // Settings
    PREFERENCES_NOT_FOUND(HttpStatus.NOT_FOUND, "PREFERENCES_NOT_FOUND", "설정 정보를 찾을 수 없습니다."),
    INVALID_THEME(HttpStatus.BAD_REQUEST, "INVALID_THEME", "올바른 테마 값이 아닙니다."),
    INVALID_LANGUAGE(HttpStatus.BAD_REQUEST, "INVALID_LANGUAGE", "올바른 언어 값이 아닙니다."),


    // User
    USER_NOT_FOUND(HttpStatus.NOT_FOUND, "USER_NOT_FOUND", "사용자를 찾을 수 없습니다."),
    DUPLICATE_EMAIL(HttpStatus.CONFLICT, "DUPLICATE_EMAIL", "이미 사용 중인 이메일입니다."),


    // Profile
    PROFILE_NOT_FOUND(HttpStatus.NOT_FOUND, "PROFILE_NOT_FOUND", "프로필을 찾을 수 없습니다."),

    // Schedule
    SCHEDULE_NOT_FOUND(HttpStatus.NOT_FOUND, "SCHEDULE_NOT_FOUND", "일정을 찾을 수 없습니다."),
    SCHEDULE_FORBIDDEN(HttpStatus.FORBIDDEN, "SCHEDULE_FORBIDDEN", "해당 일정에 접근 권한이 없습니다."),

    // Deletion
    DELETION_REQUEST_NOT_FOUND(HttpStatus.NOT_FOUND, "DELETION_REQUEST_NOT_FOUND", "탈퇴 요청을 찾을 수 없습니다."),
    DELETION_ALREADY_REQUESTED(HttpStatus.CONFLICT, "DELETION_ALREADY_REQUESTED", "이미 탈퇴 요청 중입니다."),

    // Resource
    RESOURCE_NOT_FOUND(HttpStatus.NOT_FOUND, "RESOURCE_NOT_FOUND", "요청한 데이터를 찾을 수 없습니다.");


    private final HttpStatus httpStatus;
    private final String code;
    private final String message;

    ErrorCode(HttpStatus httpStatus, String code, String message) {
        this.httpStatus = httpStatus;
        this.code = code;
        this.message = message;
    }

    public HttpStatus getHttpStatus() {
        return httpStatus;
    }

    public int getStatus() {
        return httpStatus.value();
    }

    public String getCode() {
        return code;
    }

    public String getMessage() {
        return message;
    }
}
