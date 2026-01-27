package com.example.migratemate.ARManagement.Repository;

import com.example.migratemate.ARManagement.Model.ARHistory;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ARHistoryRepository extends MongoRepository<ARHistory, String> {
    List<String> findByUserId(String userId);
}
