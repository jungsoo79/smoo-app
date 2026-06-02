package com.smoo.backend.common.response;

public class ApiResponse<T> {

    private boolean success;
    private int status;
    private String code;
    private String message;
    private T data;

    private ApiResponse(boolean success, int status, String code, String message, T data) {
        this.success = success;
        this.status = status;
        this.code = code;
        this.message = message;
        this.data = data;
    }

    public static <T> ApiResponse<T> success(SuccessCode successCode, T data) {
        return new ApiResponse<>(
                true,
                successCode.getStatus(),
                successCode.getCode(),
                successCode.getMessage(),
                data
        );
    }

    public static <T> ApiResponse<T> success(SuccessCode successCode) {
        return new ApiResponse<>(
                true,
                successCode.getStatus(),
                successCode.getCode(),
                successCode.getMessage(),
                null
        );
    }

    public static <T> ApiResponse<T> fail(int status, String code, String message) {
        return new ApiResponse<>(
                false,
                status,
                code,
                message,
                null
        );
    }

    public boolean isSuccess() {
        return success;
    }

    public int getStatus() {
        return status;
    }

    public String getCode() {
        return code;
    }

    public String getMessage() {
        return message;
    }

    public T getData() {
        return data;
    }
}