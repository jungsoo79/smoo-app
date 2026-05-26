package com.smoo.backend.deletion.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import java.time.OffsetDateTime;

@Getter
@AllArgsConstructor
public class DeletionStatusResponse {
    private Long id;
    private String status;
    private String reason;
    private OffsetDateTime requestedAt;
    private OffsetDateTime scheduledDeleteAt;
}