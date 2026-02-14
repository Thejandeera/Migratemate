package com.example.migratemate.SosManagement.Repository;

import com.example.migratemate.SosManagement.Entity.SosAlert;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SosAlertRepository extends MongoRepository<SosAlert, String> {

    List<SosAlert> findByStatus(String status);

    List<SosAlert> findByUserId(String userId);

    Optional<SosAlert> findByUserIdAndStatus(String userId, String status);

    List<SosAlert> findByStatusOrderByCreatedAtDesc(String status);
}