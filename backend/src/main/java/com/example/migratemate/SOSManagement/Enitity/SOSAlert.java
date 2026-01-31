package com.example.migratemate.SOSManagement.Enitity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.GeoSpatialIndexed;
import org.springframework.data.mongodb.core.geo.GeoJsonPoint;
import java.time.LocalDateTime;
import java.util.List;

@Document(collection = "sos_alerts")
public class SOSAlert {

    @Id
    private String id;

    private String userId;
    private String userName;
    private String userEmail;
    private String userPhone;
    private String profilePicture;

    // Location data
    @GeoSpatialIndexed
    private GeoJsonPoint location;
    private String address;
    private String city;
    private String country;

    // Alert details
    private String alertType; // EMERGENCY, MEDICAL, SAFETY, OTHER
    private String description;
    private SOSStatus status; // ACTIVE, RESPONDING, RESOLVED, CANCELLED
    private String severity; // CRITICAL, HIGH, MEDIUM, LOW

    // Timestamps
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime resolvedAt;

    // Response tracking
    private List<String> notifiedHelperIds;
    private List<String> notifiedAgencyIds;
    private List<String> respondingHelperIds;
    private String assignedHelperId;
    private String assignedHelperName;

    // Additional context
    private String deviceInfo;
    private String batteryLevel;
    private boolean isLocationAccurate;
    private double locationAccuracy; // in meters

    // Communication
    private List<SOSUpdate> updates;
    private List<String> attachmentUrls;

    public enum SOSStatus {
        ACTIVE,
        RESPONDING,
        RESOLVED,
        CANCELLED,
        FALSE_ALARM
    }

    // Constructors
    public SOSAlert() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        this.status = SOSStatus.ACTIVE;
        this.severity = "HIGH";
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

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public String getUserEmail() {
        return userEmail;
    }

    public void setUserEmail(String userEmail) {
        this.userEmail = userEmail;
    }

    public String getUserPhone() {
        return userPhone;
    }

    public void setUserPhone(String userPhone) {
        this.userPhone = userPhone;
    }

    public String getProfilePicture() {
        return profilePicture;
    }

    public void setProfilePicture(String profilePicture) {
        this.profilePicture = profilePicture;
    }

    public GeoJsonPoint getLocation() {
        return location;
    }

    public void setLocation(GeoJsonPoint location) {
        this.location = location;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getCountry() {
        return country;
    }

    public void setCountry(String country) {
        this.country = country;
    }

    public String getAlertType() {
        return alertType;
    }

    public void setAlertType(String alertType) {
        this.alertType = alertType;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public SOSStatus getStatus() {
        return status;
    }

    public void setStatus(SOSStatus status) {
        this.status = status;
        this.updatedAt = LocalDateTime.now();
        if (status == SOSStatus.RESOLVED || status == SOSStatus.CANCELLED || status == SOSStatus.FALSE_ALARM) {
            this.resolvedAt = LocalDateTime.now();
        }
    }

    public String getSeverity() {
        return severity;
    }

    public void setSeverity(String severity) {
        this.severity = severity;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public LocalDateTime getResolvedAt() {
        return resolvedAt;
    }

    public void setResolvedAt(LocalDateTime resolvedAt) {
        this.resolvedAt = resolvedAt;
    }

    public List<String> getNotifiedHelperIds() {
        return notifiedHelperIds;
    }

    public void setNotifiedHelperIds(List<String> notifiedHelperIds) {
        this.notifiedHelperIds = notifiedHelperIds;
    }

    public List<String> getNotifiedAgencyIds() {
        return notifiedAgencyIds;
    }

    public void setNotifiedAgencyIds(List<String> notifiedAgencyIds) {
        this.notifiedAgencyIds = notifiedAgencyIds;
    }

    public List<String> getRespondingHelperIds() {
        return respondingHelperIds;
    }

    public void setRespondingHelperIds(List<String> respondingHelperIds) {
        this.respondingHelperIds = respondingHelperIds;
    }

    public String getAssignedHelperId() {
        return assignedHelperId;
    }

    public void setAssignedHelperId(String assignedHelperId) {
        this.assignedHelperId = assignedHelperId;
    }

    public String getAssignedHelperName() {
        return assignedHelperName;
    }

    public void setAssignedHelperName(String assignedHelperName) {
        this.assignedHelperName = assignedHelperName;
    }

    public String getDeviceInfo() {
        return deviceInfo;
    }

    public void setDeviceInfo(String deviceInfo) {
        this.deviceInfo = deviceInfo;
    }

    public String getBatteryLevel() {
        return batteryLevel;
    }

    public void setBatteryLevel(String batteryLevel) {
        this.batteryLevel = batteryLevel;
    }

    public boolean isLocationAccurate() {
        return isLocationAccurate;
    }

    public void setLocationAccurate(boolean locationAccurate) {
        isLocationAccurate = locationAccurate;
    }

    public double getLocationAccuracy() {
        return locationAccuracy;
    }

    public void setLocationAccuracy(double locationAccuracy) {
        this.locationAccuracy = locationAccuracy;
    }

    public List<SOSUpdate> getUpdates() {
        return updates;
    }

    public void setUpdates(List<SOSUpdate> updates) {
        this.updates = updates;
    }

    public List<String> getAttachmentUrls() {
        return attachmentUrls;
    }

    public void setAttachmentUrls(List<String> attachmentUrls) {
        this.attachmentUrls = attachmentUrls;
    }

    // Helper class for updates
    public static class SOSUpdate {
        private LocalDateTime timestamp;
        private String message;
        private String updatedBy;
        private String updateType; // STATUS_CHANGE, HELPER_ASSIGNED, USER_UPDATE, ADMIN_NOTE

        public SOSUpdate() {
            this.timestamp = LocalDateTime.now();
        }

        public SOSUpdate(String message, String updatedBy, String updateType) {
            this.timestamp = LocalDateTime.now();
            this.message = message;
            this.updatedBy = updatedBy;
            this.updateType = updateType;
        }

        // Getters and Setters
        public LocalDateTime getTimestamp() {
            return timestamp;
        }

        public void setTimestamp(LocalDateTime timestamp) {
            this.timestamp = timestamp;
        }

        public String getMessage() {
            return message;
        }

        public void setMessage(String message) {
            this.message = message;
        }

        public String getUpdatedBy() {
            return updatedBy;
        }

        public void setUpdatedBy(String updatedBy) {
            this.updatedBy = updatedBy;
        }

        public String getUpdateType() {
            return updateType;
        }

        public void setUpdateType(String updateType) {
            this.updateType = updateType;
        }
    }
}