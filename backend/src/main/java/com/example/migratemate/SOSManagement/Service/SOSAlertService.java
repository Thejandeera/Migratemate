package com.example.migratemate.SOSManagement.Service;

import com.example.migratemate.SOSManagement.Dto.SOSAlertRequest;
import com.example.migratemate.SOSManagement.Enitity.SOSAlert;
import com.example.migratemate.SOSManagement.Repository.SOSAlertRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.geo.GeoJsonPoint;
import org.springframework.stereotype.Service;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class SOSAlertService {

    @Autowired
    private SOSAlertRepository sosAlertRepository;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    // Distance radius for finding nearby helpers (5km by default)
    private static final double DEFAULT_SEARCH_RADIUS_METERS = 5000;

    /**
     * Create a new SOS alert
     */
    public SOSAlert createSOSAlert(SOSAlertRequest request) {
        SOSAlert alert = new SOSAlert();

        // User information
        alert.setUserId(request.getUserId());
        alert.setUserName(request.getUserName());
        alert.setUserEmail(request.getUserEmail());
        alert.setUserPhone(request.getUserPhone());
        alert.setProfilePicture(request.getProfilePicture());

        // Location
        if (request.getLatitude() != null && request.getLongitude() != null) {
            GeoJsonPoint location = new GeoJsonPoint(request.getLongitude(), request.getLatitude());
            alert.setLocation(location);
            alert.setLocationAccurate(true);
            alert.setLocationAccuracy(request.getLocationAccuracy() != null ? request.getLocationAccuracy() : 0);
        }
        alert.setAddress(request.getAddress());
        alert.setCity(request.getCity());
        alert.setCountry(request.getCountry());

        // Alert details
        alert.setAlertType(request.getAlertType() != null ? request.getAlertType() : "EMERGENCY");
        alert.setDescription(request.getDescription());
        alert.setSeverity(request.getSeverity() != null ? request.getSeverity() : "HIGH");
        alert.setStatus(SOSAlert.SOSStatus.ACTIVE);

        // Device info
        alert.setDeviceInfo(request.getDeviceInfo());
        alert.setBatteryLevel(request.getBatteryLevel());

        // Initialize lists
        alert.setUpdates(new ArrayList<>());
        alert.setNotifiedHelperIds(new ArrayList<>());
        alert.setNotifiedAgencyIds(new ArrayList<>());
        alert.setRespondingHelperIds(new ArrayList<>());
        alert.setAttachmentUrls(new ArrayList<>());

        // Add initial update
        SOSAlert.SOSUpdate initialUpdate = new SOSAlert.SOSUpdate(
                "SOS alert created",
                request.getUserId(),
                "STATUS_CHANGE"
        );
        alert.getUpdates().add(initialUpdate);

        // Save to database
        SOSAlert savedAlert = sosAlertRepository.save(alert);

        // Notify nearby helpers and agencies via WebSocket
        notifyNearbyHelpers(savedAlert);
        notifyAgencies(savedAlert);
        notifyAdmins(savedAlert);

        return savedAlert;
    }

    /**
     * Update SOS alert location (for real-time tracking)
     */
    public SOSAlert updateAlertLocation(String alertId, Double latitude, Double longitude, String address) {
        Optional<SOSAlert> alertOpt = sosAlertRepository.findById(alertId);

        if (alertOpt.isPresent()) {
            SOSAlert alert = alertOpt.get();

            if (latitude != null && longitude != null) {
                GeoJsonPoint newLocation = new GeoJsonPoint(longitude, latitude);
                alert.setLocation(newLocation);
            }

            if (address != null) {
                alert.setAddress(address);
            }

            alert.setUpdatedAt(LocalDateTime.now());

            SOSAlert.SOSUpdate update = new SOSAlert.SOSUpdate(
                    "Location updated",
                    alert.getUserId(),
                    "USER_UPDATE"
            );
            alert.getUpdates().add(update);

            SOSAlert updatedAlert = sosAlertRepository.save(alert);

            // Broadcast location update via WebSocket
            messagingTemplate.convertAndSend("/topic/sos/" + alertId + "/location", updatedAlert);

            return updatedAlert;
        }

        throw new RuntimeException("SOS Alert not found with id: " + alertId);
    }

    /**
     * Assign a helper to respond to the SOS alert
     */
    public SOSAlert assignHelper(String alertId, String helperId, String helperName) {
        Optional<SOSAlert> alertOpt = sosAlertRepository.findById(alertId);

        if (alertOpt.isPresent()) {
            SOSAlert alert = alertOpt.get();

            alert.setAssignedHelperId(helperId);
            alert.setAssignedHelperName(helperName);
            alert.setStatus(SOSAlert.SOSStatus.RESPONDING);

            if (!alert.getRespondingHelperIds().contains(helperId)) {
                alert.getRespondingHelperIds().add(helperId);
            }

            SOSAlert.SOSUpdate update = new SOSAlert.SOSUpdate(
                    "Helper " + helperName + " has been assigned",
                    helperId,
                    "HELPER_ASSIGNED"
            );
            alert.getUpdates().add(update);

            SOSAlert updatedAlert = sosAlertRepository.save(alert);

            // Notify the user that help is on the way
            messagingTemplate.convertAndSendToUser(
                    alert.getUserId(),
                    "/queue/sos-response",
                    updatedAlert
            );

            return updatedAlert;
        }

        throw new RuntimeException("SOS Alert not found with id: " + alertId);
    }

    /**
     * Helper indicates they are responding to the alert
     */
    public SOSAlert helperResponding(String alertId, String helperId, String helperName) {
        Optional<SOSAlert> alertOpt = sosAlertRepository.findById(alertId);

        if (alertOpt.isPresent()) {
            SOSAlert alert = alertOpt.get();

            if (!alert.getRespondingHelperIds().contains(helperId)) {
                alert.getRespondingHelperIds().add(helperId);
            }

            SOSAlert.SOSUpdate update = new SOSAlert.SOSUpdate(
                    helperName + " is responding to your alert",
                    helperId,
                    "HELPER_ASSIGNED"
            );
            alert.getUpdates().add(update);

            SOSAlert updatedAlert = sosAlertRepository.save(alert);

            // Notify user
            messagingTemplate.convertAndSendToUser(
                    alert.getUserId(),
                    "/queue/sos-response",
                    updatedAlert
            );

            return updatedAlert;
        }

        throw new RuntimeException("SOS Alert not found with id: " + alertId);
    }

    /**
     * Resolve/Close an SOS alert
     */
    public SOSAlert resolveAlert(String alertId, String resolvedBy, String resolution) {
        Optional<SOSAlert> alertOpt = sosAlertRepository.findById(alertId);

        if (alertOpt.isPresent()) {
            SOSAlert alert = alertOpt.get();

            alert.setStatus(SOSAlert.SOSStatus.RESOLVED);
            alert.setResolvedAt(LocalDateTime.now());

            SOSAlert.SOSUpdate update = new SOSAlert.SOSUpdate(
                    "Alert resolved: " + resolution,
                    resolvedBy,
                    "STATUS_CHANGE"
            );
            alert.getUpdates().add(update);

            SOSAlert resolvedAlert = sosAlertRepository.save(alert);

            // Notify all relevant parties
            messagingTemplate.convertAndSend("/topic/sos/" + alertId + "/resolved", resolvedAlert);

            return resolvedAlert;
        }

        throw new RuntimeException("SOS Alert not found with id: " + alertId);
    }

    /**
     * Cancel an SOS alert (false alarm)
     */
    public SOSAlert cancelAlert(String alertId, String userId, String reason) {
        Optional<SOSAlert> alertOpt = sosAlertRepository.findById(alertId);

        if (alertOpt.isPresent()) {
            SOSAlert alert = alertOpt.get();

            // Verify the user cancelling is the one who created it
            if (!alert.getUserId().equals(userId)) {
                throw new RuntimeException("Only the alert creator can cancel this alert");
            }

            alert.setStatus(SOSAlert.SOSStatus.CANCELLED);
            alert.setResolvedAt(LocalDateTime.now());

            SOSAlert.SOSUpdate update = new SOSAlert.SOSUpdate(
                    "Alert cancelled: " + reason,
                    userId,
                    "STATUS_CHANGE"
            );
            alert.getUpdates().add(update);

            SOSAlert cancelledAlert = sosAlertRepository.save(alert);

            // Notify responders
            messagingTemplate.convertAndSend("/topic/sos/" + alertId + "/cancelled", cancelledAlert);

            return cancelledAlert;
        }

        throw new RuntimeException("SOS Alert not found with id: " + alertId);
    }

    /**
     * Get active alerts near a location
     */
    public List<SOSAlert> getActiveAlertsNearLocation(Double latitude, Double longitude, Double radiusKm) {
        GeoJsonPoint location = new GeoJsonPoint(longitude, latitude);
        double radiusMeters = radiusKm != null ? radiusKm * 1000 : DEFAULT_SEARCH_RADIUS_METERS;

        return sosAlertRepository.findActiveAlertsNearLocation(location, radiusMeters);
    }

    /**
     * Get all active alerts
     */
    public List<SOSAlert> getAllActiveAlerts() {
        return sosAlertRepository.findByStatus(SOSAlert.SOSStatus.ACTIVE);
    }

    /**
     * Get alert by ID
     */
    public SOSAlert getAlertById(String alertId) {
        return sosAlertRepository.findById(alertId)
                .orElseThrow(() -> new RuntimeException("SOS Alert not found with id: " + alertId));
    }

    /**
     * Get user's alert history
     */
    public List<SOSAlert> getUserAlertHistory(String userId) {
        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);
        return sosAlertRepository.findRecentAlertsByUserId(userId, thirtyDaysAgo);
    }

    /**
     * Get alerts assigned to a helper
     */
    public List<SOSAlert> getHelperAssignedAlerts(String helperId) {
        return sosAlertRepository.findByAssignedHelperId(helperId);
    }

    /**
     * Add update/note to alert
     */
    public SOSAlert addUpdateToAlert(String alertId, String message, String updatedBy, String updateType) {
        Optional<SOSAlert> alertOpt = sosAlertRepository.findById(alertId);

        if (alertOpt.isPresent()) {
            SOSAlert alert = alertOpt.get();

            SOSAlert.SOSUpdate update = new SOSAlert.SOSUpdate(message, updatedBy, updateType);
            alert.getUpdates().add(update);
            alert.setUpdatedAt(LocalDateTime.now());

            SOSAlert updatedAlert = sosAlertRepository.save(alert);

            // Broadcast update
            messagingTemplate.convertAndSend("/topic/sos/" + alertId + "/updates", update);

            return updatedAlert;
        }

        throw new RuntimeException("SOS Alert not found with id: " + alertId);
    }

    /**
     * Notify nearby helpers via WebSocket
     */
    private void notifyNearbyHelpers(SOSAlert alert) {
        // This would integrate with your UserManagement to find helpers nearby
        // For now, we'll broadcast to a general topic
        messagingTemplate.convertAndSend("/topic/sos/new-alerts", alert);

        // In a real implementation, you would:
        // 1. Query helpers within radius
        // 2. Filter by availability and verification status
        // 3. Send personalized notifications
    }

    /**
     * Notify agencies
     */
    private void notifyAgencies(SOSAlert alert) {
        // Broadcast to agencies in the same city/country
        messagingTemplate.convertAndSend("/topic/agencies/sos-alerts/" + alert.getCountry(), alert);
    }

    /**
     * Notify platform admins
     */
    private void notifyAdmins(SOSAlert alert) {
        messagingTemplate.convertAndSend("/topic/admin/sos-alerts", alert);
    }
}