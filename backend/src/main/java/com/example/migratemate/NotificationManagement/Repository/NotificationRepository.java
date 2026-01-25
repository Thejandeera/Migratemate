package com.example.migratemate.NotificationManagement.Repository;

import com.example.migratemate.NotificationManagement.Entity.Notification;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends MongoRepository<Notification, String> {
    List<Notification> findByUserId(String userId);

    void deleteByUserId(String userId);
}
