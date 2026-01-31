package com.example.migratemate.SOSManagement.Controller;

import com.example.migratemate.SOSManagement.Dto.*;

import com.example.migratemate.SOSManagement.Enitity.SOSAlert;
import com.example.migratemate.SOSManagement.Service.SOSAlertService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/sos")
@CrossOrigin(origins = "*")
public class SOSAlertController {

    @Autowired
    private SOSAlertService sosAlertService;

    /**
     * Create a new SOS alert
     * POST /api/sos/alert
     */
    @PostMapping("/alert")
    public ResponseEntity<?> createSOSAlert(@RequestBody SOSAlertRequest request) {
        try {
            SOSAlert alert = sosAlertService.createSOSAlert(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                    "success", true,
                    "message", "SOS alert created successfully",
                    "alert", alert
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "success", false,
                    "message", "Failed to create SOS alert: " + e.getMessage()
            ));
        }
    }

    /**
     * Update alert location (real-time tracking)
     * PUT /api/sos/alert/{alertId}/location
     */
    @PutMapping("/alert/{alertId}/location")
    public ResponseEntity<?> updateAlertLocation(
            @PathVariable String alertId,
            @RequestBody Map<String, Object> locationData) {
        try {
            Double latitude = locationData.get("latitude") != null ?
                    Double.parseDouble(locationData.get("latitude").toString()) : null;
            Double longitude = locationData.get("longitude") != null ?
                    Double.parseDouble(locationData.get("longitude").toString()) : null;
            String address = (String) locationData.get("address");

            SOSAlert updatedAlert = sosAlertService.updateAlertLocation(alertId, latitude, longitude, address);

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Location updated successfully",
                    "alert", updatedAlert
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "success", false,
                    "message", "Failed to update location: " + e.getMessage()
            ));
        }
    }

    /**
     * Helper responds to alert
     * POST /api/sos/alert/{alertId}/respond
     */
    @PostMapping("/alert/{alertId}/respond")
    public ResponseEntity<?> helperRespond(
            @PathVariable String alertId,
            @RequestBody Map<String, String> helperData) {
        try {
            String helperId = helperData.get("helperId");
            String helperName = helperData.get("helperName");

            SOSAlert updatedAlert = sosAlertService.helperResponding(alertId, helperId, helperName);

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Helper response recorded",
                    "alert", updatedAlert
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                    "success", false,
                    "message", e.getMessage()
            ));
        }
    }

    /**
     * Assign helper to alert
     * POST /api/sos/alert/{alertId}/assign
     */
    @PostMapping("/alert/{alertId}/assign")
    public ResponseEntity<?> assignHelper(
            @PathVariable String alertId,
            @RequestBody Map<String, String> helperData) {
        try {
            String helperId = helperData.get("helperId");
            String helperName = helperData.get("helperName");

            SOSAlert updatedAlert = sosAlertService.assignHelper(alertId, helperId, helperName);

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Helper assigned successfully",
                    "alert", updatedAlert
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                    "success", false,
                    "message", e.getMessage()
            ));
        }
    }

    /**
     * Resolve an alert
     * PUT /api/sos/alert/{alertId}/resolve
     */
    @PutMapping("/alert/{alertId}/resolve")
    public ResponseEntity<?> resolveAlert(
            @PathVariable String alertId,
            @RequestBody Map<String, String> resolutionData) {
        try {
            String resolvedBy = resolutionData.get("resolvedBy");
            String resolution = resolutionData.get("resolution");

            SOSAlert resolvedAlert = sosAlertService.resolveAlert(alertId, resolvedBy, resolution);

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Alert resolved successfully",
                    "alert", resolvedAlert
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                    "success", false,
                    "message", e.getMessage()
            ));
        }
    }

    /**
     * Cancel an alert
     * PUT /api/sos/alert/{alertId}/cancel
     */
    @PutMapping("/alert/{alertId}/cancel")
    public ResponseEntity<?> cancelAlert(
            @PathVariable String alertId,
            @RequestBody Map<String, String> cancellationData) {
        try {
            String userId = cancellationData.get("userId");
            String reason = cancellationData.get("reason");

            SOSAlert cancelledAlert = sosAlertService.cancelAlert(alertId, userId, reason);

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Alert cancelled successfully",
                    "alert", cancelledAlert
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                    "success", false,
                    "message", e.getMessage()
            ));
        }
    }

    /**
     * Get alert by ID
     * GET /api/sos/alert/{alertId}
     */
    @GetMapping("/alert/{alertId}")
    public ResponseEntity<?> getAlertById(@PathVariable String alertId) {
        try {
            SOSAlert alert = sosAlertService.getAlertById(alertId);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "alert", alert
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                    "success", false,
                    "message", e.getMessage()
            ));
        }
    }

    /**
     * Get active alerts near a location
     * GET /api/sos/alerts/nearby?latitude=X&longitude=Y&radius=Z
     */
    @GetMapping("/alerts/nearby")
    public ResponseEntity<?> getNearbyAlerts(
            @RequestParam Double latitude,
            @RequestParam Double longitude,
            @RequestParam(required = false, defaultValue = "5") Double radius) {
        try {
            List<SOSAlert> alerts = sosAlertService.getActiveAlertsNearLocation(latitude, longitude, radius);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "count", alerts.size(),
                    "alerts", alerts
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "success", false,
                    "message", e.getMessage()
            ));
        }
    }

    /**
     * Get all active alerts
     * GET /api/sos/alerts/active
     */
    @GetMapping("/alerts/active")
    public ResponseEntity<?> getAllActiveAlerts() {
        try {
            List<SOSAlert> alerts = sosAlertService.getAllActiveAlerts();
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "count", alerts.size(),
                    "alerts", alerts
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "success", false,
                    "message", e.getMessage()
            ));
        }
    }

    /**
     * Get user's alert history
     * GET /api/sos/alerts/user/{userId}
     */
    @GetMapping("/alerts/user/{userId}")
    public ResponseEntity<?> getUserAlertHistory(@PathVariable String userId) {
        try {
            List<SOSAlert> alerts = sosAlertService.getUserAlertHistory(userId);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "count", alerts.size(),
                    "alerts", alerts
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "success", false,
                    "message", e.getMessage()
            ));
        }
    }

    /**
     * Get helper's assigned alerts
     * GET /api/sos/alerts/helper/{helperId}
     */
    @GetMapping("/alerts/helper/{helperId}")
    public ResponseEntity<?> getHelperAlerts(@PathVariable String helperId) {
        try {
            List<SOSAlert> alerts = sosAlertService.getHelperAssignedAlerts(helperId);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "count", alerts.size(),
                    "alerts", alerts
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "success", false,
                    "message", e.getMessage()
            ));
        }
    }

    /**
     * Add update/note to alert
     * POST /api/sos/alert/{alertId}/update
     */
    @PostMapping("/alert/{alertId}/update")
    public ResponseEntity<?> addUpdate(
            @PathVariable String alertId,
            @RequestBody Map<String, String> updateData) {
        try {
            String message = updateData.get("message");
            String updatedBy = updateData.get("updatedBy");
            String updateType = updateData.get("updateType");

            SOSAlert updatedAlert = sosAlertService.addUpdateToAlert(alertId, message, updatedBy, updateType);

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Update added successfully",
                    "alert", updatedAlert
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                    "success", false,
                    "message", e.getMessage()
            ));
        }
    }
}