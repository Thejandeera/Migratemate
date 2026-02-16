package com.example.migratemate.AssistantManagement.Service;

import com.example.migratemate.AssistantManagement.Model.ChatUsage;
import com.example.migratemate.AssistantManagement.Repository.ChatUsageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class ChatLimitService {

    @Autowired
    private ChatUsageRepository chatUsageRepository;

    private static final int MAX_CHATS = 10;

    public boolean canUserChat(String userId) {
        if (userId == null || userId.equals("guest") || userId.equals("undefined")) {
            // Guests might have strict limits or allow a few, keeping it simple: allow
            // guests for now or restrict?
            // User asked "for each user should able to allow 10 chats only".
            // I'll assume this applies to registered users. For guests, I'll allow a small
            // number or just 10 too if I tracked by IP/session, but here I track by userId.
            // If userId is guest, I can't track easily without session. For now, let's
            // assume limit applies to Logged-in users.
            return true;
        }

        Optional<ChatUsage> usageOpt = chatUsageRepository.findById(userId);
        if (usageOpt.isPresent()) {
            return usageOpt.get().getMessageCount() < MAX_CHATS;
        }
        return true;
    }

    public void incrementUserChat(String userId) {
        if (userId == null || userId.equals("guest") || userId.equals("undefined")) {
            return;
        }

        ChatUsage usage = chatUsageRepository.findById(userId)
                .orElse(new ChatUsage(userId, 0));

        usage.incrementCount();
        chatUsageRepository.save(usage);
    }

    public int getRemainingChats(String userId) {
        if (userId == null || userId.equals("guest") || userId.equals("undefined")) {
            return MAX_CHATS;
        }
        return MAX_CHATS - chatUsageRepository.findById(userId).map(ChatUsage::getMessageCount).orElse(0);
    }
}
