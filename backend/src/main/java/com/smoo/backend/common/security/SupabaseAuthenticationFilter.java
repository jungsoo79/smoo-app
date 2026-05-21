package com.smoo.backend.common.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smoo.backend.common.exception.CustomException;
import com.smoo.backend.common.exception.ErrorCode;
import com.smoo.backend.common.response.ApiResponse;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
public class SupabaseAuthenticationFilter extends OncePerRequestFilter {

    private final SupabaseAuthClient supabaseAuthClient;
    private final ObjectMapper objectMapper;

    public SupabaseAuthenticationFilter(
            SupabaseAuthClient supabaseAuthClient,
            ObjectMapper objectMapper
    ) {
        this.supabaseAuthClient = supabaseAuthClient;
        this.objectMapper = objectMapper;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        String authorizationHeader = request.getHeader("Authorization");

        if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        String accessToken = authorizationHeader.substring(7);

        try {
            AuthenticatedUser authenticatedUser = supabaseAuthClient.getUser(accessToken);

            UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(
                            authenticatedUser,
                            null,
                            List.of(new SimpleGrantedAuthority("ROLE_USER"))
                    );

            SecurityContextHolder.getContext().setAuthentication(authentication);

            filterChain.doFilter(request, response);

        } catch (CustomException e) {
            SecurityContextHolder.clearContext();

            response.setStatus(e.getErrorCode().getStatus());
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            response.setCharacterEncoding("UTF-8");

            objectMapper.writeValue(
                    response.getWriter(),
                    ApiResponse.fail(
                            e.getErrorCode().getStatus(),
                            e.getErrorCode().getCode(),
                            e.getMessage()
                    )
            );
        }
    }
}