package com.example.migratemate.AssistantManagement.Repository;

import com.example.migratemate.AssistantManagement.Model.ChatHistory;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatHistoryRepository extends MongoRepository<ChatHistory, String> {
    List<ChatHistory> findByUserId(String userId);
}
