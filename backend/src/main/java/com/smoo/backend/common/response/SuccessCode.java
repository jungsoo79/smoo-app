package com.smoo.backend.common.response;

import org.springframework.http.HttpStatus;

public enum SuccessCode {

    COMMON_SUCCESS(HttpStatus.OK, "COMMON_SUCCESS", "요청이 성공적으로 처리되었습니다."),
    CREATED(HttpStatus.CREATED, "CREATED", "데이터가 성공적으로 생성되었습니다."),
    UPDATED(HttpStatus.OK, "UPDATED", "데이터가 성공적으로 수정되었습니다."),
    DELETED(HttpStatus.OK, "DELETED", "데이터가 성공적으로 삭제되었습니다."),

    LOGIN_SUCCESS(HttpStatus.OK, "LOGIN_SUCCESS", "로그인이 완료되었습니다."),
    SIGNUP_SUCCESS(HttpStatus.CREATED, "SIGNUP_SUCCESS", "회원가입이 완료되었습니다.");

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