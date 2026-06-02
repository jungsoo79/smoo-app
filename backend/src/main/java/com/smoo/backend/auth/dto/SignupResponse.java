package com.smoo.backend.auth.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SignupResponse {
    private String id;
    private String email;
    private String nickname;
}
