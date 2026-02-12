package com.example.migratemate.SOSManagement.Enitity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Document(collection = "sos_alerts")
public class SOSAlert {

    @Id
    private String id;

    // Reference to User entity (weak entity relationship)
    private String userId;

    // Location data
    private Double longitude;
    private Double latitude;

    // Timestamp
    private LocalDateTime createdAt;

    // Constructors
    public SOSAlert() {
        this.createdAt = LocalDateTime.now();
    }

    public SOSAlert(String userId, Double longitude, Double latitude) {
        this.userId = userId;
        this.longitude = longitude;
        this.latitude = latitude;
        this.createdAt = LocalDateTime.now();
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public Double getLongitude() {
        return longitude;
    }

    public void setLongitude(Double longitude) {
        this.longitude = longitude;
    }

    public Double getLatitude() {
        return latitude;
    }

    public void setLatitude(Double latitude) {
        this.latitude = latitude;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}