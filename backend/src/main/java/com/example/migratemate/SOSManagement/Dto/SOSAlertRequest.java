package com.example.migratemate.SOSManagement.Dto;

public class SOSAlertRequest {

    private String userId;
    private Double latitude;
    private Double longitude;

    // Constructors
    public SOSAlertRequest() {}

    public SOSAlertRequest(String userId, Double latitude, Double longitude) {
        this.userId = userId;
        this.latitude = latitude;
        this.longitude = longitude;
    }

    // Getters and Setters
    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public Double getLatitude() {
        return latitude;
    }

    public void setLatitude(Double latitude) {
        this.latitude = latitude;
    }

    public Double getLongitude() {
        return longitude;
    }

    public void setLongitude(Double longitude) {
        this.longitude = longitude;
    }
}