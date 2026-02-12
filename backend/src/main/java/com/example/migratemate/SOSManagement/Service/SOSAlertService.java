package com.example.migratemate.SOSManagement.Service;

import com.example.migratemate.SOSManagement.Dto.SOSAlertRequest;
import com.example.migratemate.SOSManagement.Enitity.SOSAlert;
import com.example.migratemate.SOSManagement.Repository.SOSAlertRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class SOSAlertService {

    @Autowired
    private SOSAlertRepository sosAlertRepository;

    /**
     * Create a new SOS alert
     */
    public SOSAlert createSOSAlert(SOSAlertRequest request) {
        SOSAlert alert = new SOSAlert(
            request.getUserId(),
            request.getLongitude(),
            request.getLatitude()
        );

        return sosAlertRepository.save(alert);
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
        return sosAlertRepository.findByUserId(userId);
    }

    /**
     * Get recent alerts for a user (last 30 days)
     */
    public List<SOSAlert> getRecentUserAlerts(String userId) {
        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);
        return sosAlertRepository.findRecentAlertsByUserId(userId, thirtyDaysAgo);
    }

    /**
     * Get all SOS alerts
     */
    public List<SOSAlert> getAllAlerts() {
        return sosAlertRepository.findAll();
    }

    /**
     * Delete an alert
     */
    public void deleteAlert(String alertId) {
        sosAlertRepository.deleteById(alertId);
    }
}