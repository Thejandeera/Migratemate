package com.example.migratemate.CommunityManagement.Controller;

import com.example.migratemate.CommunityManagement.Dto.ChatMessageDto;
import com.example.migratemate.CommunityManagement.Dto.MessageRequest;
import com.example.migratemate.CommunityManagement.Dto.MessageResponse;
import com.example.migratemate.CommunityManagement.Dto.TypingNotificationDto;
import com.example.migratemate.CommunityManagement.Service.MessageService;
import com.example.migratemate.UserManagement.Entity.User;
import com.example.migratemate.UserManagement.Repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.security.Principal;
import java.time.LocalDateTime;

@Controller
@RequiredArgsConstructor
@Slf4j
public class WebSocketMessageController {

    private final SimpMessagingTemplate messagingTemplate;
    private final MessageService messageService;
    private final UserRepository userRepository;

    /**
     * Handle incoming chat messages from clients
     * Client sends to: /app/chat.sendMessage
     * Server broadcasts to: /topic/community/{communityId}
     */
    @MessageMapping("/chat.sendMessage")
    public void sendMessage(@Payload ChatMessageDto chatMessage, Principal principal) {
        try {
            log.info("Received WebSocket message from: {}", principal.getName());

            // Get sender details
            User sender = userRepository.findByEmail(principal.getName())
                    .orElseThrow(() -> new IllegalArgumentException("User not found"));

            // Create MessageRequest for persistence
            MessageRequest request = MessageRequest.builder()
                    .senderId(sender.getId()) // Set senderId from authenticated user
                    .communityId(chatMessage.getCommunityId())
                    .recipientId(chatMessage.getRecipientId())
                    .content(chatMessage.getContent())
                    .type(chatMessage.getType() == ChatMessageDto.MessageType.CHAT ? "TEXT" : "TEXT")
                    .build();

            // Save message to database
            MessageResponse savedMessage = messageService.sendMessage(request);

            // Prepare WebSocket message
            ChatMessageDto broadcastMessage = ChatMessageDto.builder()
                    .id(savedMessage.getId())
                    .senderId(sender.getId())
                    .senderName(sender.getFullName())
                    .senderAvatar(sender.getAvatarUrl())
                    .communityId(chatMessage.getCommunityId())
                    .recipientId(chatMessage.getRecipientId())
                    .content(chatMessage.getContent())
                    .type(ChatMessageDto.MessageType.CHAT)
                    .fileUrl(savedMessage.getFileUrl())
                    .timestamp(savedMessage.getTimestamp())
                    .build();

            // Broadcast to community
            if (chatMessage.getCommunityId() != null) {
                messagingTemplate.convertAndSend(
                        "/topic/community/" + chatMessage.getCommunityId(),
                        broadcastMessage);
                log.info("Message broadcasted to community: {}", chatMessage.getCommunityId());
            }

            // Send direct message
            if (chatMessage.getRecipientId() != null) {
                messagingTemplate.convertAndSendToUser(
                        chatMessage.getRecipientId(),
                        "/queue/messages",
                        broadcastMessage);
                log.info("Direct message sent to user: {}", chatMessage.getRecipientId());
            }

        } catch (Exception e) {
            log.error("Failed to send WebSocket message", e);
        }
    }

    /**
     * Handle user join notification
     * Client sends to: /app/chat.addUser
     * Server broadcasts to: /topic/community/{communityId}
     */
    @MessageMapping("/chat.addUser")
    public void addUser(@Payload ChatMessageDto chatMessage,
            SimpMessageHeaderAccessor headerAccessor,
            Principal principal) {
        try {
            // Get user details
            User user = userRepository.findByEmail(principal.getName())
                    .orElseThrow(() -> new IllegalArgumentException("User not found"));

            // Store username in WebSocket session
            headerAccessor.getSessionAttributes().put("username", user.getFullName());
            headerAccessor.getSessionAttributes().put("userId", user.getId());

            // Create join notification
            ChatMessageDto joinMessage = ChatMessageDto.builder()
                    .senderId(user.getId())
                    .senderName(user.getFullName())
                    .senderAvatar(user.getAvatarUrl())
                    .communityId(chatMessage.getCommunityId())
                    .content(user.getFullName() + " joined the chat")
                    .type(ChatMessageDto.MessageType.JOIN)
                    .timestamp(LocalDateTime.now())
                    .build();

            // Broadcast join notification
            messagingTemplate.convertAndSend(
                    "/topic/community/" + chatMessage.getCommunityId(),
                    joinMessage);

            log.info("User {} joined community {}", user.getFullName(), chatMessage.getCommunityId());

        } catch (Exception e) {
            log.error("Failed to add user to WebSocket", e);
        }
    }

    /**
     * Handle typing notifications
     * Client sends to: /app/chat.typing
     * Server broadcasts to: /topic/community/{communityId}/typing
     */
    @MessageMapping("/chat.typing")
    public void handleTyping(@Payload TypingNotificationDto notification, Principal principal) {
        try {
            User user = userRepository.findByEmail(principal.getName())
                    .orElseThrow(() -> new IllegalArgumentException("User not found"));

            notification.setUserId(user.getId());
            notification.setUserName(user.getFullName());

            // Broadcast typing notification to community
            messagingTemplate.convertAndSend(
                    "/topic/community/" + notification.getCommunityId() + "/typing",
                    notification);

            log.debug("Typing notification from: {} in community: {}",
                    user.getFullName(), notification.getCommunityId());

        } catch (Exception e) {
            log.error("Failed to handle typing notification", e);
        }
    }
}