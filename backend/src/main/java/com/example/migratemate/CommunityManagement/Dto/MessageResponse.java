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
public class MessageResponse {
    private String id;
    private String senderId;
    private String senderName;
    private String senderAvatar;
    private String communityId;
    private String recipientId;
    private String content;
    private String type;
    private String fileUrl;
    private Boolean isEdited;
    private LocalDateTime timestamp;
    private LocalDateTime editedAt;
}