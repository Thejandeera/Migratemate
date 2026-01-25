package com.example.migratemate.CommunityManagement.Entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "messages")
public class Message {

    @Id
    private String id;

    @Indexed
    private String senderId;

    private String senderName;

    private String senderAvatar;

    @Indexed
    private String communityId; // For group chat

    @Indexed
    private String recipientId; // For direct messages (null for group chat)

    private String content;

    private MessageType type; // TEXT, IMAGE, FILE

    private String fileUrl; // If type is IMAGE or FILE

    @Builder.Default
    private Boolean isEdited = false;

    @Builder.Default
    private Boolean isDeleted = false;

    @Builder.Default
    private LocalDateTime timestamp = LocalDateTime.now();

    private LocalDateTime editedAt;

    public enum MessageType {
        TEXT, IMAGE, FILE
    }
}