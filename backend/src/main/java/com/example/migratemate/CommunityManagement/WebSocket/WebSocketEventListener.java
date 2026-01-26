package com.example.migratemate.CommunityManagement.WebSocket;

import com.example.migratemate.CommunityManagement.Dto.ChatMessageDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectedEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
@Slf4j
public class WebSocketEventListener {

    private final SimpMessagingTemplate messagingTemplate;

    /**
     * Handle WebSocket connection established
     */
    @EventListener
    public void handleWebSocketConnectListener(SessionConnectedEvent event) {
        log.info("New WebSocket connection established");
    }

    /**
     * Handle WebSocket disconnection
     * Send leave notification when user disconnects
     */
    @EventListener
    public void handleWebSocketDisconnectListener(SessionDisconnectEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());

        String username = (String) headerAccessor.getSessionAttributes().get("username");
        String userId = (String) headerAccessor.getSessionAttributes().get("userId");
        String communityId = (String) headerAccessor.getSessionAttributes().get("communityId");

        if (username != null && communityId != null) {
            log.info("User {} disconnected from community {}", username, communityId);

            // Create leave notification
            ChatMessageDto leaveMessage = ChatMessageDto.builder()
                    .senderId(userId)
                    .senderName(username)
                    .communityId(communityId)
                    .content(username + " left the chat")
                    .type(ChatMessageDto.MessageType.LEAVE)
                    .timestamp(LocalDateTime.now())
                    .build();

            // Broadcast leave notification
            messagingTemplate.convertAndSend(
                    "/topic/community/" + communityId,
                    leaveMessage
            );
        }
    }
}