package com.example.migratemate.CommunityManagement.Dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessageDto {
    private String id;
    private String senderId;
    private String senderName;
    private String senderAvatar;
    private String communityId;
    private String recipientId; // For direct messages
    private String content;
    private MessageType type;
    private String fileUrl;
    private LocalDateTime timestamp;

    public enum MessageType {
        CHAT,           // Regular text message
        JOIN,           // User joined community
        LEAVE,          // User left community
        TYPING,         // User is typing
        STOP_TYPING     // User stopped typing
    }
}