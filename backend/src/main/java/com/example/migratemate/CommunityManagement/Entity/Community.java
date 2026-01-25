package com.example.migratemate.CommunityManagement.Entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "communities")
@CompoundIndex(name = "origin_destination_idx", def = "{'originCountry': 1, 'destinationCountry': 1}")
public class Community {

    @Id
    private String id;

    private String name; // e.g., "Sri Lankans in Australia"

    private String originCountry; // e.g., "Sri Lanka"

    private String destinationCountry; // e.g., "Australia"

    private String description;

    private String rules; // Community guidelines

    private String coverImageUrl;

    @Builder.Default
    private Integer memberCount = 0;

    @Builder.Default
    private Boolean isActive = true;

    // Admin/Agency who manages this community
    private String managedByAgencyId;

    @Builder.Default
    private List<String> moderatorIds = new ArrayList<>();

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();

    public void updateTimestamp() {
        this.updatedAt = LocalDateTime.now();
    }

    public void incrementMemberCount() {
        this.memberCount++;
        updateTimestamp();
    }

    public void decrementMemberCount() {
        if (this.memberCount > 0) {
            this.memberCount--;
        }
        updateTimestamp();
    }
}