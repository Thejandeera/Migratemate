package com.example.migratemate.AssistantManagement.Model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "chat_usage")
public class ChatUsage {

    @Id
    private String userId;
    private int messageCount;

    public ChatUsage() {
    }

    public ChatUsage(String userId, int messageCount) {
        this.userId = userId;
        this.messageCount = messageCount;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public int getMessageCount() {
        return messageCount;
    }

    public void setMessageCount(int messageCount) {
        this.messageCount = messageCount;
    }

    public void incrementCount() {
        this.messageCount++;
    }
}
