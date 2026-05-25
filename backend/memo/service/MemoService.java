package com.smoo.backend.memo.service;

import com.smoo.backend.common.exception.CustomException;
import com.smoo.backend.common.exception.ErrorCode;
import com.smoo.backend.memo.domain.Memo;
import com.smoo.backend.memo.domain.MemoAttachment;
import com.smoo.backend.memo.domain.MemoCategory;
import com.smoo.backend.memo.dto.request.*;
import com.smoo.backend.memo.dto.response.*;
import com.smoo.backend.memo.repository.MemoAttachmentRepository;
import com.smoo.backend.memo.repository.MemoCategoryRepository;
import com.smoo.backend.memo.repository.MemoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MemoService {

    private final MemoRepository memoRepository;
    private final MemoCategoryRepository memoCategoryRepository;
    private final MemoAttachmentRepository memoAttachmentRepository;

    public List<MemoSummaryResponse> getMemos(UUID userId, String keyword, Long categoryId) {
        return memoRepository.searchMemos(userId, keyword, categoryId)
                .stream()
                .map(this::toSummaryResponse)
                .toList();
    }

    public MemoDetailResponse getMemo(UUID userId, Long memoId) {
        Memo memo = getMemoOrThrow(userId, memoId);
        return toDetailResponse(memo);
    }

    @Transactional
    public MemoDetailResponse createMemo(UUID userId, MemoCreateRequest request) {
        validateCategory(userId, request.getCategoryId());

        Memo memo = Memo.create(
                userId,
                request.getCategoryId(),
                request.getTitle(),
                request.getContent(),
                request.getPinned()
        );

        Memo savedMemo = memoRepository.save(memo);
        return toDetailResponse(savedMemo);
    }

    @Transactional
    public MemoDetailResponse updateMemo(UUID userId, Long memoId, MemoUpdateRequest request) {
        Memo memo = getMemoOrThrow(userId, memoId);
        validateCategory(userId, request.getCategoryId());

        memo.update(
                request.getCategoryId(),
                request.getTitle(),
                request.getContent(),
                request.getPinned()
        );

        return toDetailResponse(memo);
    }

    @Transactional
    public void deleteMemo(UUID userId, Long memoId) {
        Memo memo = getMemoOrThrow(userId, memoId);
        memo.delete();
    }

    public List<MemoCategoryResponse> getCategories(UUID userId) {
        return memoCategoryRepository.findByUserIdOrderByCreatedAtAsc(userId)
                .stream()
                .map(this::toCategoryResponse)
                .toList();
    }

    @Transactional
    public MemoCategoryResponse createCategory(UUID userId, MemoCategoryCreateRequest request) {
        MemoCategory category = MemoCategory.create(
                userId,
                request.getName(),
                request.getColor(),
                false
        );

        MemoCategory savedCategory = memoCategoryRepository.save(category);
        return toCategoryResponse(savedCategory);
    }

    @Transactional
    public MemoCategoryResponse updateCategory(UUID userId, Long categoryId, MemoCategoryUpdateRequest request) {
        MemoCategory category = memoCategoryRepository.findByIdAndUserId(categoryId, userId)
                .orElseThrow(() -> new CustomException(ErrorCode.RESOURCE_NOT_FOUND, "메모 카테고리를 찾을 수 없습니다."));

        category.update(request.getName(), request.getColor());

        return toCategoryResponse(category);
    }

    @Transactional
    public void deleteCategory(UUID userId, Long categoryId) {
        MemoCategory category = memoCategoryRepository.findByIdAndUserId(categoryId, userId)
                .orElseThrow(() -> new CustomException(ErrorCode.RESOURCE_NOT_FOUND, "메모 카테고리를 찾을 수 없습니다."));

        memoCategoryRepository.delete(category);
    }

    @Transactional
    public MemoAttachmentResponse addAttachment(UUID userId, Long memoId, MemoAttachmentCreateRequest request) {
        Memo memo = getMemoOrThrow(userId, memoId);

        MemoAttachment attachment = MemoAttachment.create(
                memo.getId(),
                userId,
                request.getOriginalFileName(),
                request.getFileUrl(),
                request.getFileType(),
                request.getFileSize()
        );

        MemoAttachment savedAttachment = memoAttachmentRepository.save(attachment);

        return toAttachmentResponse(savedAttachment);
    }

    @Transactional
    public void deleteAttachment(UUID userId, Long memoId, Long attachmentId) {
        getMemoOrThrow(userId, memoId);

        MemoAttachment attachment = memoAttachmentRepository
                .findByIdAndMemoIdAndUserId(attachmentId, memoId, userId)
                .orElseThrow(() -> new CustomException(ErrorCode.RESOURCE_NOT_FOUND, "첨부파일을 찾을 수 없습니다."));

        memoAttachmentRepository.delete(attachment);
    }

    private Memo getMemoOrThrow(UUID userId, Long memoId) {
        return memoRepository.findByIdAndUserIdAndDeletedAtIsNull(memoId, userId)
                .orElseThrow(() -> new CustomException(ErrorCode.RESOURCE_NOT_FOUND, "메모를 찾을 수 없습니다."));
    }

    private void validateCategory(UUID userId, Long categoryId) {
        if (categoryId == null) {
            return;
        }

        memoCategoryRepository.findByIdAndUserId(categoryId, userId)
                .orElseThrow(() -> new CustomException(ErrorCode.RESOURCE_NOT_FOUND, "메모 카테고리를 찾을 수 없습니다."));
    }

    private MemoSummaryResponse toSummaryResponse(Memo memo) {
        MemoCategory category = getCategoryOrNull(memo.getUserId(), memo.getCategoryId());

        long attachmentCount = memoAttachmentRepository.countByMemoIdAndUserId(
                memo.getId(),
                memo.getUserId()
        );

        return new MemoSummaryResponse(
                memo.getId(),
                memo.getCategoryId(),
                category != null ? category.getName() : null,
                category != null ? category.getColor() : null,
                memo.getTitle(),
                makePreview(memo.getContent()),
                memo.getPinned(),
                attachmentCount,
                memo.getCreatedAt(),
                memo.getUpdatedAt()
        );
    }

    private MemoDetailResponse toDetailResponse(Memo memo) {
        MemoCategory category = getCategoryOrNull(memo.getUserId(), memo.getCategoryId());

        List<MemoAttachmentResponse> attachments = memoAttachmentRepository
                .findByMemoIdAndUserIdOrderByCreatedAtAsc(memo.getId(), memo.getUserId())
                .stream()
                .map(this::toAttachmentResponse)
                .toList();

        return new MemoDetailResponse(
                memo.getId(),
                memo.getCategoryId(),
                category != null ? category.getName() : null,
                category != null ? category.getColor() : null,
                memo.getTitle(),
                memo.getContent(),
                memo.getPinned(),
                attachments,
                memo.getCreatedAt(),
                memo.getUpdatedAt()
        );
    }

    private MemoCategory getCategoryOrNull(UUID userId, Long categoryId) {
        if (categoryId == null) {
            return null;
        }

        return memoCategoryRepository.findByIdAndUserId(categoryId, userId)
                .orElse(null);
    }

    private MemoCategoryResponse toCategoryResponse(MemoCategory category) {
        return new MemoCategoryResponse(
                category.getId(),
                category.getName(),
                category.getColor(),
                category.getIsDefault()
        );
    }

    private MemoAttachmentResponse toAttachmentResponse(MemoAttachment attachment) {
        return new MemoAttachmentResponse(
                attachment.getId(),
                attachment.getOriginalFileName(),
                attachment.getFileUrl(),
                attachment.getFileType(),
                attachment.getFileSize()
        );
    }

    private String makePreview(String content) {
        if (content == null || content.isBlank()) {
            return "";
        }

        String normalized = content.replace("\n", " ").trim();

        if (normalized.length() <= 80) {
            return normalized;
        }

        return normalized.substring(0, 80) + "...";
    }
}