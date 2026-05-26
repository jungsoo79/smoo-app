package com.smoo.backend.auth;

import com.smoo.backend.auth.dto.LoginRequest;
import com.smoo.backend.auth.dto.LoginResponse;
import com.smoo.backend.auth.dto.PasswordChangeRequest;
import com.smoo.backend.auth.dto.SignupRequest;
import com.smoo.backend.auth.dto.SignupResponse;
import com.smoo.backend.common.response.ApiResponse;
import com.smoo.backend.common.response.SuccessCode;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/signup")
    public ResponseEntity<ApiResponse<SignupResponse>> signup(@Valid @RequestBody SignupRequest request) {
        SignupResponse response = authService.signup(request);
        return ResponseEntity.status(201).body(ApiResponse.success(SuccessCode.SIGNUP_SUCCESS, response));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponse>> login(@Valid @RequestBody LoginRequest request) {
        LoginResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success(SuccessCode.LOGIN_SUCCESS, response));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(@RequestHeader("Authorization") String authHeader) {
        String accessToken = authHeader.replace("Bearer ", "");
        authService.logout(accessToken);
        return ResponseEntity.ok(ApiResponse.success(SuccessCode.LOGOUT_SUCCESS));
    }

    @PostMapping("/verify-email")
    public ResponseEntity<ApiResponse<Void>> verifyEmail(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String token = request.get("token");
        authService.verifyEmail(email, token);
        return ResponseEntity.ok(ApiResponse.success(SuccessCode.VERIFY_EMAIL_SUCCESS));
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<LoginResponse>> refresh(@RequestBody Map<String, String> request) {
        String refreshToken = request.get("refresh_token");
        LoginResponse response = authService.refresh(refreshToken);
        return ResponseEntity.ok(ApiResponse.success(SuccessCode.REFRESH_SUCCESS, response));
    }

    @PostMapping("/password/forgot")
    public ResponseEntity<ApiResponse<Void>> forgotPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        authService.forgotPassword(email);
        return ResponseEntity.ok(ApiResponse.success(SuccessCode.PASSWORD_RESET_EMAIL_SENT));
    }

    @PostMapping("/password/verify-otp")
    public ResponseEntity<ApiResponse<Map<String, String>>> verifyPasswordOtp(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String token = request.get("token");
        String accessToken = authService.verifyPasswordOtp(email, token);
        return ResponseEntity.ok(ApiResponse.success(SuccessCode.COMMON_SUCCESS, Map.of("access_token", accessToken)));
    }

    @PostMapping("/password/reset")
    public ResponseEntity<ApiResponse<Void>> resetPassword(@RequestHeader("Authorization") String authHeader,
                                                            @RequestBody Map<String, String> request) {
        String accessToken = authHeader.replace("Bearer ", "");
        String newPassword = request.get("password");
        authService.resetPassword(accessToken, newPassword);
        return ResponseEntity.ok(ApiResponse.success(SuccessCode.PASSWORD_UPDATE_SUCCESS));
    }

    @PatchMapping("/password/change")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody PasswordChangeRequest request) {
        String accessToken = authHeader.replace("Bearer ", "");
        authService.changePassword(accessToken, request.getCurrentPassword(), request.getNewPassword());
        return ResponseEntity.ok(ApiResponse.success(SuccessCode.PASSWORD_UPDATE_SUCCESS));
    }
}