package com.example.migratemate.AssistantManagement.Service;

import com.example.migratemate.AssistantManagement.Model.ChatUsage;
import com.example.migratemate.AssistantManagement.Repository.ChatUsageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class ChatLimitService {

    @Autowired
    private ChatUsageRepository chatUsageRepository;

    private static final int MAX_CHATS = 10;

    public boolean canUserChat(String userId) {
        if (userId == null || userId.equals("guest") || userId.equals("undefined")) {
            return true;
        }

        ChatUsage usage = chatUsageRepository.findById(userId).orElse(new ChatUsage(userId, 0));

        // Check for reset
        if (usage.getLastResetTime() == null
                || usage.getLastResetTime().toLocalDate().isBefore(java.time.LocalDate.now())) {
            usage.setMessageCount(0);
            usage.setLastResetTime(java.time.LocalDateTime.now());
            chatUsageRepository.save(usage);
        }

        return usage.getMessageCount() < MAX_CHATS;
    }

    public void incrementUserChat(String userId) {
        if (userId == null || userId.equals("guest") || userId.equals("undefined")) {
            return;
        }

        ChatUsage usage = chatUsageRepository.findById(userId)
                .orElse(new ChatUsage(userId, 0));

        // Ensure reset check happens here too in case first action is increment
        // (unlikely but safe)
        if (usage.getLastResetTime() == null
                || usage.getLastResetTime().toLocalDate().isBefore(java.time.LocalDate.now())) {
            usage.setMessageCount(0);
            usage.setLastResetTime(java.time.LocalDateTime.now());
        }

        usage.incrementCount();
        chatUsageRepository.save(usage);
    }

    public java.util.Map<String, Object> getUsageStats(String userId) {
        System.out.println("DEBUG: getUsageStats called for userId: " + userId);
        java.util.Map<String, Object> stats = new java.util.HashMap<>();

        if (userId == null || userId.equals("guest") || userId.equals("undefined")) {
            System.out.println("DEBUG: userId is null/guest/undefined, returning default stats.");
            stats.put("count", 0);
            stats.put("limit", MAX_CHATS);
            stats.put("remaining", MAX_CHATS);
            return stats;
        }

        ChatUsage usage = chatUsageRepository.findById(userId).orElse(new ChatUsage(userId, 0));

        // Helper reset check for display accuracy
        if (usage.getLastResetTime() == null
                || usage.getLastResetTime().toLocalDate().isBefore(java.time.LocalDate.now())) {
            usage.setMessageCount(0);
            usage.setLastResetTime(java.time.LocalDateTime.now());
            chatUsageRepository.save(usage);
        }

        stats.put("count", usage.getMessageCount());
        stats.put("limit", MAX_CHATS);
        stats.put("remaining", MAX_CHATS - usage.getMessageCount());

        // Calculate next reset (midnight tomorrow)
        java.time.LocalDateTime nextReset = java.time.LocalDate.now().plusDays(1).atStartOfDay();
        stats.put("nextReset", nextReset.toString());

        return stats;
    }
}
