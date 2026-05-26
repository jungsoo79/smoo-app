package com.smoo.backend.common.response;

import org.springframework.http.HttpStatus;

public enum SuccessCode {

    COMMON_SUCCESS(HttpStatus.OK, "COMMON_SUCCESS", "요청이 성공적으로 처리되었습니다."),
    CREATED(HttpStatus.CREATED, "CREATED", "데이터가 성공적으로 생성되었습니다."),
    UPDATED(HttpStatus.OK, "UPDATED", "데이터가 성공적으로 수정되었습니다."),
    DELETED(HttpStatus.OK, "DELETED", "데이터가 성공적으로 삭제되었습니다."),

    LOGIN_SUCCESS(HttpStatus.OK, "LOGIN_SUCCESS", "로그인이 완료되었습니다."),
    SIGNUP_SUCCESS(HttpStatus.CREATED, "SIGNUP_SUCCESS", "회원가입이 완료되었습니다."),
    LOGOUT_SUCCESS(HttpStatus.OK, "LOGOUT_SUCCESS", "로그아웃이 완료되었습니다."),
    VERIFY_EMAIL_SUCCESS(HttpStatus.OK, "VERIFY_EMAIL_SUCCESS", "이메일 인증이 완료되었습니다."),
    REFRESH_SUCCESS(HttpStatus.OK, "REFRESH_SUCCESS", "토큰이 갱신되었습니다."),
    PASSWORD_RESET_EMAIL_SENT(HttpStatus.OK, "PASSWORD_RESET_EMAIL_SENT", "비밀번호 재설정 코드가 이메일로 발송되었습니다."),
    PASSWORD_UPDATE_SUCCESS(HttpStatus.OK, "PASSWORD_UPDATE_SUCCESS", "비밀번호가 변경되었습니다."),
    DELETION_REQUEST_SUCCESS(HttpStatus.CREATED, "DELETION_REQUEST_SUCCESS", "탈퇴 요청이 완료되었습니다."),
    DELETION_CANCEL_SUCCESS(HttpStatus.OK, "DELETION_CANCEL_SUCCESS", "탈퇴 요청이 취소되었습니다.");

    private final HttpStatus httpStatus;
    private final String code;
    private final String message;

    SuccessCode(HttpStatus httpStatus, String code, String message) {
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