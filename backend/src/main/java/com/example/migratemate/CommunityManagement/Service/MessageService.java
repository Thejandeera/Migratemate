package com.example.migratemate.CommunityManagement.Service;

import com.example.migratemate.CommunityManagement.Dto.MessageRequest;
import com.example.migratemate.CommunityManagement.Dto.MessageResponse;
import com.example.migratemate.CommunityManagement.Entity.Message;
import com.example.migratemate.CommunityManagement.Entity.CommunityMembership;
import com.example.migratemate.CommunityManagement.Repository.MessageRepository;
import com.example.migratemate.CommunityManagement.Repository.CommunityMembershipRepository;
import com.example.migratemate.UserManagement.Entity.User;
import com.example.migratemate.UserManagement.Repository.UserRepository;
import com.example.migratemate.UserManagement.Service.CloudinaryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class MessageService {

    private final MessageRepository messageRepository;
    private final UserRepository userRepository;
    private final CommunityMembershipRepository membershipRepository;
    private final CloudinaryService cloudinaryService;

    /**
     * Send a message (group or direct)
     */
    @Transactional
    public MessageResponse sendMessage(MessageRequest request, String senderEmail) throws IOException {
        User sender = userRepository.findByEmail(senderEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        // Verify sender is member of community (if group message)
        if (request.getCommunityId() != null) {
            membershipRepository.findByUserIdAndCommunityId(sender.getId(), request.getCommunityId())
                    .orElseThrow(() -> new IllegalArgumentException("You are not a member of this community"));
        }

        // Upload file if provided
        String fileUrl = null;
        if (request.getFileBase64() != null && !request.getFileBase64().isEmpty()) {
            try {
                fileUrl = cloudinaryService.uploadImageFromBase64(
                        request.getFileBase64(),
                        "migratemate/messages"
                );
            } catch (IOException e) {
                log.error("Failed to upload message file", e);
                throw new IOException("Failed to upload file: " + e.getMessage());
            }
        }

        // Create message
        Message message = Message.builder()
                .senderId(sender.getId())
                .senderName(sender.getFullName())
                .senderAvatar(sender.getAvatarUrl())
                .communityId(request.getCommunityId())
                .recipientId(request.getRecipientId())
                .content(request.getContent())
                .type(Message.MessageType.valueOf(request.getType().toUpperCase()))
                .fileUrl(fileUrl)
                .isEdited(false)
                .isDeleted(false)
                .timestamp(LocalDateTime.now())
                .build();

        message = messageRepository.save(message);

        // Update last active for sender
        if (request.getCommunityId() != null) {
            membershipRepository.findByUserIdAndCommunityId(sender.getId(), request.getCommunityId())
                    .ifPresent(membership -> {
                        membership.updateActivity();
                        membershipRepository.save(membership);
                    });
        }

        log.info("Message sent by {} in community {}", sender.getEmail(), request.getCommunityId());

        return mapToMessageResponse(message);
    }

    /**
     * Get community chat history (paginated)
     */
    public List<MessageResponse> getCommunityMessages(String communityId, String userEmail, int page, int size) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        // Verify user is member
        membershipRepository.findByUserIdAndCommunityId(user.getId(), communityId)
                .orElseThrow(() -> new IllegalArgumentException("You are not a member of this community"));

        Pageable pageable = PageRequest.of(page, size);
        Page<Message> messagesPage = messageRepository
                .findByCommunityIdAndIsDeletedFalseOrderByTimestampDesc(communityId, pageable);

        return messagesPage.getContent().stream()
                .map(this::mapToMessageResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get direct messages between two users (paginated)
     */
    public List<MessageResponse> getDirectMessages(String otherUserId, String userEmail, int page, int size) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Pageable pageable = PageRequest.of(page, size);
        Page<Message> messagesPage = messageRepository
                .findBySenderIdAndRecipientIdOrRecipientIdAndSenderIdAndIsDeletedFalseOrderByTimestampDesc(
                        user.getId(), otherUserId, user.getId(), otherUserId, pageable);

        return messagesPage.getContent().stream()
                .map(this::mapToMessageResponse)
                .collect(Collectors.toList());
    }

    /**
     * Edit a message
     */
    @Transactional
    public MessageResponse editMessage(String messageId, String newContent, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new IllegalArgumentException("Message not found"));

        // Verify user is the sender
        if (!message.getSenderId().equals(user.getId())) {
            throw new IllegalArgumentException("You can only edit your own messages");
        }

        message.setContent(newContent);
        message.setIsEdited(true);
        message.setEditedAt(LocalDateTime.now());

        message = messageRepository.save(message);
        log.info("Message {} edited by {}", messageId, user.getEmail());

        return mapToMessageResponse(message);
    }

    /**
     * Delete a message (soft delete)
     */
    @Transactional
    public void deleteMessage(String messageId, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new IllegalArgumentException("Message not found"));

        // Verify user is the sender
        if (!message.getSenderId().equals(user.getId())) {
            throw new IllegalArgumentException("You can only delete your own messages");
        }

        message.setIsDeleted(true);
        messageRepository.save(message);

        log.info("Message {} deleted by {}", messageId, user.getEmail());
    }

    /**
     * Map Message entity to MessageResponse DTO
     */
    private MessageResponse mapToMessageResponse(Message message) {
        return MessageResponse.builder()
                .id(message.getId())
                .senderId(message.getSenderId())
                .senderName(message.getSenderName())
                .senderAvatar(message.getSenderAvatar())
                .communityId(message.getCommunityId())
                .recipientId(message.getRecipientId())
                .content(message.getContent())
                .type(message.getType().name())
                .fileUrl(message.getFileUrl())
                .isEdited(message.getIsEdited())
                .timestamp(message.getTimestamp())
                .editedAt(message.getEditedAt())
                .build();
    }
}