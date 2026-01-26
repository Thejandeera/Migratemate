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
public class MemberResponse {
    private String userId;
    private String fullName;
    private String avatarUrl;
    private String bio;
    private String location;
    private Boolean isVerified;
    private Boolean isHelper;
    private Boolean isModerator;
    private Double rating;
    private LocalDateTime joinedAt;
    private LocalDateTime lastActiveAt;
}