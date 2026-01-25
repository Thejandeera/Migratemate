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
public class CommunityResponse {
    private String id;
    private String name;
    private String originCountry;
    private String destinationCountry;
    private String description;
    private String rules;
    private String coverImageUrl;
    private Integer memberCount;
    private Boolean isActive;
    private Boolean isMember; // Is current user a member?
    private Boolean isModerator; // Is current user a moderator?
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}