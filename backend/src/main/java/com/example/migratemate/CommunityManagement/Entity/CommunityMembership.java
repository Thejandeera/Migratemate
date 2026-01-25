package com.example.migratemate.CommunityManagement.Entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "community_memberships")
@CompoundIndex(name = "user_community_idx", def = "{'userId': 1, 'communityId': 1}", unique = true)
public class CommunityMembership {

    @Id
    private String id;

    private String userId;

    private String communityId;

    @Builder.Default
    private Boolean isModerator = false;

    @Builder.Default
    private Boolean isMuted = false;

    @Builder.Default
    private LocalDateTime joinedAt = LocalDateTime.now();

    @Builder.Default
    private LocalDateTime lastActiveAt = LocalDateTime.now();

    public void updateActivity() {
        this.lastActiveAt = LocalDateTime.now();
    }
}