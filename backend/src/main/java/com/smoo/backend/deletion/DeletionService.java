package com.smoo.backend.deletion;

import com.smoo.backend.common.exception.CustomException;
import com.smoo.backend.common.exception.ErrorCode;
import com.smoo.backend.deletion.dto.DeletionCreateRequest;
import com.smoo.backend.deletion.dto.DeletionStatusResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DeletionService {

    private final AccountDeletionRequestRepository deletionRequestRepository;

    // 탈퇴 요청 조회
    public DeletionStatusResponse getDeletionStatus(UUID userId) {
        AccountDeletionRequest deletion = deletionRequestRepository
                .findPendingByUserId(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.DELETION_REQUEST_NOT_FOUND));

        return new DeletionStatusResponse(
                deletion.getId(),
                deletion.getStatus(),
                deletion.getReason(),
                deletion.getRequestedAt(),
                deletion.getScheduledDeleteAt()
        );
    }

    // 탈퇴 요청 생성
    @Transactional
    public DeletionStatusResponse createDeletionRequest(UUID userId, DeletionCreateRequest request) {
        // 이미 탈퇴 요청 중인지 확인
        deletionRequestRepository.findPendingByUserId(userId).ifPresent(d -> {
            throw new CustomException(ErrorCode.DELETION_ALREADY_REQUESTED);
        });

        deletionRequestRepository.insertDeletionRequest(
            userId,
            request.getReason(),
            OffsetDateTime.now(),
            OffsetDateTime.now().plusDays(30)
        );

        AccountDeletionRequest deletion = deletionRequestRepository
            .findPendingByUserId(userId)
            .orElseThrow(() -> new CustomException(ErrorCode.DELETION_REQUEST_NOT_FOUND));

        return new DeletionStatusResponse(
                deletion.getId(),
                deletion.getStatus(),
                deletion.getReason(),
                deletion.getRequestedAt(),
                deletion.getScheduledDeleteAt()
        );
    }

    // 탈퇴 요청 취소
    @Transactional
    public void cancelDeletionRequest(UUID userId, Long requestId) {
        AccountDeletionRequest deletion = deletionRequestRepository
                .findByIdAndUserId(requestId, userId)
                .orElseThrow(() -> new CustomException(ErrorCode.DELETION_REQUEST_NOT_FOUND));

        deletionRequestRepository.delete(deletion);
    }
}