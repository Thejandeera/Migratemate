package com.example.migratemate.JourneyManagement.Repository;

import com.example.migratemate.JourneyManagement.Model.JourneyPlanEntity;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface JourneyPlanRepository extends MongoRepository<JourneyPlanEntity, String> {
    List<JourneyPlanEntity> findByUserId(String userId);
}
