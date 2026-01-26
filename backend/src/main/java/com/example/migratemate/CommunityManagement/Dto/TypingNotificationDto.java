package com.example.migratemate.CommunityManagement.Dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TypingNotificationDto {
    private String userId;
    private String userName;
    private String communityId;
    private Boolean isTyping; // true = typing, false = stopped typing
}