package com.example.migratemate.SOSManagement.Repository;

import com.example.migratemate.SOSManagement.Enitity.SOSAlert;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface SOSAlertRepository extends MongoRepository<SOSAlert, String> {

    // Find alerts by user ID
    List<SOSAlert> findByUserId(String userId);

    // Find alerts created within a time range
    List<SOSAlert> findByCreatedAtBetween(LocalDateTime startDate, LocalDateTime endDate);

    // Find recent alerts for a user
    @Query("{ 'userId': ?0, 'createdAt': { $gte: ?1 } }")
    List<SOSAlert> findRecentAlertsByUserId(String userId, LocalDateTime since);

    // Count alerts for a user
    long countByUserId(String userId);
}