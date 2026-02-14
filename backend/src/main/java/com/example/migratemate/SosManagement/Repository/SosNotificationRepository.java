package com.example.migratemate.SosManagement.Repository;

import com.example.migratemate.SosManagement.Entity.SosNotification;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SosNotificationRepository extends MongoRepository<SosNotification, String> {

    List<SosNotification> findByUserIdOrderByCreatedAtDesc(String userId);

    Long countByUserIdAndIsRead(String userId, Boolean isRead);

    List<SosNotification> findBySosAlertId(String sosAlertId);

    void deleteByUserId(String userId);

    void deleteBySosAlertId(String sosAlertId);
}