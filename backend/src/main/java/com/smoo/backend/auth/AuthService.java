package com.smoo.backend.auth;

import com.smoo.backend.auth.dto.LoginRequest;
import com.smoo.backend.auth.dto.LoginResponse;
import com.smoo.backend.auth.dto.SignupRequest;
import com.smoo.backend.auth.dto.SignupResponse;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.*;
import java.util.HashMap;
import java.util.Map;

@Service
public class AuthService {

    @Value("${supabase.url}")
    private String supabaseUrl;

    @Value("${supabase.anon-key}")
    private String supabaseAnonKey;

    private final RestTemplate restTemplate = new RestTemplate();

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

            return loginResponse;

        } catch (HttpClientErrorException e) {
            String errorBody = e.getResponseBodyAsString();
            if (errorBody.contains("Invalid login credentials")) {
                throw new RuntimeException("INVALID_CREDENTIALS");
            } else {
                throw new RuntimeException("LOGIN_FAILED");
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
            throw new RuntimeException("LOGOUT_FAILED");
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
                throw new RuntimeException("EMAIL_ALREADY_EXISTS");
            } else if (errorBody.contains("weak_password")) {
                throw new RuntimeException("WEAK_PASSWORD");
            } else if (errorBody.contains("rate limit")) {
                throw new RuntimeException("EMAIL_RATE_LIMIT");
            } else if (errorBody.contains("invalid format")) {
                throw new RuntimeException("INVALID_EMAIL");
            } else {
                throw new RuntimeException("SIGNUP_FAILED");
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
                throw new RuntimeException("OTP_EXPIRED");
            } else if (errorBody.contains("invalid")) {
                throw new RuntimeException("OTP_INVALID");
            } else {
                throw new RuntimeException("VERIFY_FAILED");
            }
        }
    }
}