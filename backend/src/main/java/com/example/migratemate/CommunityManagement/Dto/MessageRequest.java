package com.example.migratemate.CommunityManagement.Dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MessageRequest {
    private String senderId; // ID of the user sending the message
    private String communityId; // For group chat
    private String recipientId; // For direct message
    private String content;
    private String type; // TEXT, IMAGE, FILE
    private String fileBase64; // If sending image/file
}