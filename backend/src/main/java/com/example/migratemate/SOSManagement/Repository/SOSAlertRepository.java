package com.example.migratemate.SOSManagement;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.data.mongodb.core.geo.GeoJsonPoint;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface SOSAlertRepository extends MongoRepository<SOSAlert, String> {

    // Find active alerts for a specific user
    List<SOSAlert> findByUserIdAndStatus(String userId, SOSAlert.SOSStatus status);

    // Find all active alerts
    List<SOSAlert> findByStatus(SOSAlert.SOSStatus status);

    // Find alerts by status in a list
    List<SOSAlert> findByStatusIn(List<SOSAlert.SOSStatus> statuses);

    // Find alerts within a certain radius (in meters) of a location
    @Query("{ 'location': { $near: { $geometry: ?0, $maxDistance: ?1 } }, 'status': 'ACTIVE' }")
    List<SOSAlert> findActiveAlertsNearLocation(GeoJsonPoint location, double maxDistanceInMeters);

    // Find alerts in a specific country/city
    List<SOSAlert> findByCityAndCountryAndStatus(String city, String country, SOSAlert.SOSStatus status);

    // Find alerts by alert type
    List<SOSAlert> findByAlertTypeAndStatus(String alertType, SOSAlert.SOSStatus status);

    // Find alerts created within a time range
    List<SOSAlert> findByCreatedAtBetween(LocalDateTime startDate, LocalDateTime endDate);

    // Find alerts assigned to a specific helper
    List<SOSAlert> findByAssignedHelperId(String helperId);

    // Find alerts where a helper is responding
    @Query("{ 'respondingHelperIds': ?0 }")
    List<SOSAlert> findByRespondingHelperId(String helperId);

    // Find recent alerts for a user (last 30 days)
    @Query("{ 'userId': ?0, 'createdAt': { $gte: ?1 } }")
    List<SOSAlert> findRecentAlertsByUserId(String userId, LocalDateTime since);

    // Count active alerts
    long countByStatus(SOSAlert.SOSStatus status);

    // Count alerts for a user
    long countByUserId(String userId);

    // Find alerts by severity and status
    List<SOSAlert> findBySeverityAndStatus(String severity, SOSAlert.SOSStatus status);
}