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
@Document(collection = "sos_notifications")
public class SosNotification {

    @Id
    private String id;

    private String userId;
    private String sosAlertId;
    private String title;
    private String message;
    private String notificationType; // SOS_ALERT, SOS_RESPONSE, SOS_RESOLVED

    @Builder.Default
    private Boolean isRead = false;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    // Extra SOS-specific fields
    private String alertUserName;
    private String alertUserAvatar;
    private Double alertLatitude;
    private Double alertLongitude;
    private String alertAddress;
}