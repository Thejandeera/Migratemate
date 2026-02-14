package com.example.migratemate.SosManagement.Entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "sos_alerts")
public class SosAlert {

    @Id
    private String id;

    private String userId;
    private String userName;
    private String userEmail;
    private String userPhone;
    private String userAvatar;

    // Location details
    private Double latitude;
    private Double longitude;
    private String address;

    // Alert details
    private String message;
    private String status; // ACTIVE, RESOLVED, CANCELLED

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime resolvedAt;

    // Helper details (if someone responds)
    private String helperId;
    private String helperName;
}