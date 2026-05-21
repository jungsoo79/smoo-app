package com.smoo.backend.auth;

import com.smoo.backend.auth.dto.LoginRequest;
import com.smoo.backend.auth.dto.LoginResponse;
import com.smoo.backend.auth.dto.SignupRequest;
import com.smoo.backend.auth.dto.SignupResponse;
import com.smoo.backend.common.exception.CustomException;
import com.smoo.backend.common.exception.ErrorCode;
import com.smoo.backend.deletion.AccountDeletionRequest;
import com.smoo.backend.deletion.AccountDeletionRequestRepository;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.*;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
public class AuthService {

    @Value("${supabase.url}")
    private String supabaseUrl;

    @Value("${supabase.anon-key}")
    private String supabaseAnonKey;

    private final RestTemplate restTemplate = new RestTemplate();
    private final AccountDeletionRequestRepository deletionRequestRepository;

    public AuthService(AccountDeletionRequestRepository deletionRequestRepository) {
        this.deletionRequestRepository = deletionRequestRepository;
    }

    public LoginResponse login(LoginRequest request) {
        String url = supabaseUrl + "/auth/v1/token?grant_type=password";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("apikey", supabaseAnonKey);

        Map<String, String> body = new HashMap<>();
        body.put("email", request.getEmail());
        body.put("password", request.getPassword());

        HttpEntity<Map<String, String>> entity = new HttpEntity<>(body, headers);

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);
            Map<String, Object> responseBody = response.getBody();

            LoginResponse loginResponse = new LoginResponse();
            loginResponse.setAccessToken((String) responseBody.get("access_token"));
            loginResponse.setRefreshToken((String) responseBody.get("refresh_token"));
            loginResponse.setTokenType((String) responseBody.get("token_type"));
            loginResponse.setExpiresIn(((Number) responseBody.get("expires_in")).longValue());
            Map<String, Object> userMap = (Map<String, Object>) responseBody.get("user");
            if (userMap != null) {
                UUID userId = UUID.fromString((String) userMap.get("id"));
                Optional<AccountDeletionRequest> deletion = deletionRequestRepository
                    .findPendingByUserId(userId);

                if (deletion.isPresent()) {
                    loginResponse.setIsDeletionPending(true);
                    loginResponse.setScheduledDeleteAt(deletion.get().getScheduledDeleteAt());
                } else {
                    loginResponse.setIsDeletionPending(false);
                }
            }

            return loginResponse;

        } catch (HttpClientErrorException e) {
            String errorBody = e.getResponseBodyAsString();
            if (errorBody.contains("Invalid login credentials")) {
                throw new CustomException(ErrorCode.INVALID_CREDENTIALS);
            } else {
                throw new CustomException(ErrorCode.LOGIN_FAILED);
            }
        }
    }

    public void logout(String accessToken) {
        String url = supabaseUrl + "/auth/v1/logout";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("apikey", supabaseAnonKey);
        headers.setBearerAuth(accessToken);

        HttpEntity<Void> entity = new HttpEntity<>(headers);

        try {
            restTemplate.postForEntity(url, entity, Void.class);
        } catch (HttpClientErrorException e) {
            throw new CustomException(ErrorCode.LOGOUT_FAILED);
        }
    }

    public SignupResponse signup(SignupRequest request) {
        String url = supabaseUrl + "/auth/v1/signup";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("apikey", supabaseAnonKey);

        Map<String, String> body = new HashMap<>();
        body.put("email", request.getEmail());
        body.put("password", request.getPassword());

        HttpEntity<Map<String, String>> entity = new HttpEntity<>(body, headers);

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);
            Map<String, Object> responseBody = response.getBody();

            SignupResponse signupResponse = new SignupResponse();
            Map<String, Object> userMap = (Map<String, Object>) responseBody.get("user");
            if (userMap != null) {
                signupResponse.setId((String) userMap.get("id"));
                signupResponse.setEmail((String) userMap.get("email"));
            } else {
                signupResponse.setId((String) responseBody.get("id"));
                signupResponse.setEmail((String) responseBody.get("email"));
            }

            return signupResponse;

        } catch (HttpClientErrorException e) {
            String errorBody = e.getResponseBodyAsString();
            if (errorBody.contains("already registered")) {
                throw new CustomException(ErrorCode.EMAIL_ALREADY_EXISTS);
            } else if (errorBody.contains("weak_password")) {
                throw new CustomException(ErrorCode.WEAK_PASSWORD);
            } else if (errorBody.contains("rate limit")) {
                throw new CustomException(ErrorCode.EMAIL_RATE_LIMIT);
            } else if (errorBody.contains("email_address_invalid")) {
                throw new CustomException(ErrorCode.INVALID_EMAIL);
            } else {
                throw new CustomException(ErrorCode.SIGNUP_FAILED);
            }
        }
    }

    public void verifyEmail(String email, String token) {
        String url = supabaseUrl + "/auth/v1/verify";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("apikey", supabaseAnonKey);

        Map<String, String> body = new HashMap<>();
        body.put("type", "signup");
        body.put("email", email);
        body.put("token", token);

        HttpEntity<Map<String, String>> entity = new HttpEntity<>(body, headers);

        try {
            restTemplate.postForEntity(url, entity, Map.class);
        } catch (HttpClientErrorException e) {
            String errorBody = e.getResponseBodyAsString();
            if (errorBody.contains("Token has expired")) {
                throw new CustomException(ErrorCode.OTP_EXPIRED);
            } else if (errorBody.contains("invalid")) {
                throw new CustomException(ErrorCode.OTP_INVALID);
            } else {
                throw new CustomException(ErrorCode.VERIFY_FAILED);
            }
        }
    }

    public LoginResponse refresh(String refreshToken) {
        String url = supabaseUrl + "/auth/v1/token?grant_type=refresh_token";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("apikey", supabaseAnonKey);

        Map<String, String> body = new HashMap<>();
        body.put("refresh_token", refreshToken);

        HttpEntity<Map<String, String>> entity = new HttpEntity<>(body, headers);

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);
            Map<String, Object> responseBody = response.getBody();

            LoginResponse loginResponse = new LoginResponse();
            loginResponse.setAccessToken((String) responseBody.get("access_token"));
            loginResponse.setRefreshToken((String) responseBody.get("refresh_token"));
            loginResponse.setTokenType((String) responseBody.get("token_type"));
            loginResponse.setExpiresIn(((Number) responseBody.get("expires_in")).longValue());

            return loginResponse;

        } catch (HttpClientErrorException e) {
            throw new CustomException(ErrorCode.INVALID_REFRESH_TOKEN);
        }
    }

    public void forgotPassword(String email) {
        String url = supabaseUrl + "/auth/v1/otp";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("apikey", supabaseAnonKey);

        Map<String, Object> body = new HashMap<>();
        body.put("email", email);
        body.put("create_user", false);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

        try {
            restTemplate.postForEntity(url, entity, Map.class);
        } catch (HttpClientErrorException e) {
            String errorBody = e.getResponseBodyAsString();
            if (errorBody.contains("rate limit")) {
                throw new CustomException(ErrorCode.EMAIL_RATE_LIMIT);
            } else if (errorBody.contains("email_address_invalid")) {
                throw new CustomException(ErrorCode.INVALID_EMAIL);
            } else {
                throw new CustomException(ErrorCode.PASSWORD_RESET_FAILED);
            }
        }
    }

    public String verifyPasswordOtp(String email, String token) {
        String url = supabaseUrl + "/auth/v1/verify";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("apikey", supabaseAnonKey);

        Map<String, String> body = new HashMap<>();
        body.put("type", "recovery");
        body.put("email", email);
        body.put("token", token);

        HttpEntity<Map<String, String>> entity = new HttpEntity<>(body, headers);

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);
            Map<String, Object> responseBody = response.getBody();
            return (String) responseBody.get("access_token");
        } catch (HttpClientErrorException e) {
            String errorBody = e.getResponseBodyAsString();
            if (errorBody.contains("Token has expired")) {
                throw new CustomException(ErrorCode.OTP_EXPIRED);
            } else if (errorBody.contains("invalid")) {
                throw new CustomException(ErrorCode.OTP_INVALID);
            } else {
                throw new CustomException(ErrorCode.VERIFY_FAILED);
            }
        }
    }

    public void resetPassword(String accessToken, String newPassword) {
        String url = supabaseUrl + "/auth/v1/user";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("apikey", supabaseAnonKey);
        headers.setBearerAuth(accessToken);

        Map<String, String> body = new HashMap<>();
        body.put("password", newPassword);

        HttpEntity<Map<String, String>> entity = new HttpEntity<>(body, headers);

        try {
            restTemplate.exchange(url, HttpMethod.PUT, entity, Map.class);
        } catch (HttpClientErrorException e) {
            String errorBody = e.getResponseBodyAsString();
            if (errorBody.contains("weak_password")) {
                throw new CustomException(ErrorCode.WEAK_PASSWORD);
            } else {
                throw new CustomException(ErrorCode.PASSWORD_UPDATE_FAILED);
            }
        }
    }
}