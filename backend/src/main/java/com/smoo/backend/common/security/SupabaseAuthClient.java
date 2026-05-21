package com.smoo.backend.common.security;

import com.smoo.backend.common.exception.CustomException;
import com.smoo.backend.common.exception.ErrorCode;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

@Component
public class SupabaseAuthClient {

    private final RestClient restClient;

    @Value("${supabase.url}")
    private String supabaseUrl;

    @Value("${supabase.anon-key}")
    private String supabaseAnonKey;

    public SupabaseAuthClient(RestClient.Builder restClientBuilder) {
        this.restClient = restClientBuilder.build();
    }

    public AuthenticatedUser getUser(String accessToken) {
        try {
            SupabaseUserResponse response = restClient.get()
                    .uri(supabaseUrl + "/auth/v1/user")
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken)
                    .header("apikey", supabaseAnonKey)
                    .retrieve()
                    .body(SupabaseUserResponse.class);

            if (response == null || response.id() == null) {
                throw new CustomException(ErrorCode.AUTH_USER_NOT_FOUND);
            }

            return new AuthenticatedUser(
                    response.id(),
                    response.email()
            );

        } catch (RestClientException e) {
            throw new CustomException(ErrorCode.INVALID_TOKEN);
        }
    }
}