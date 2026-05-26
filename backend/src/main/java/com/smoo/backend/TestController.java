package com.smoo.backend;

import com.smoo.backend.common.exception.CustomException;
import com.smoo.backend.common.exception.ErrorCode;
import com.smoo.backend.common.response.ApiResponse;
import com.smoo.backend.common.response.SuccessCode;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
public class TestController {

    @GetMapping("/api/test/success")
    public ResponseEntity<ApiResponse<Map<String, String>>> testSuccess() {

        Map<String, String> data = Map.of(
                "message", "공통 응답 형식 테스트 성공"
        );

        return ResponseEntity
                .status(SuccessCode.COMMON_SUCCESS.getHttpStatus())
                .body(ApiResponse.success(SuccessCode.COMMON_SUCCESS, data));
    }

    @GetMapping("/api/test/error")
    public ResponseEntity<ApiResponse<Void>> testError() {
        throw new CustomException(ErrorCode.USER_NOT_FOUND);
    }
}
