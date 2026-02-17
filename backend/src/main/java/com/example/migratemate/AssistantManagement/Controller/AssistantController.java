package com.example.migratemate.AssistantManagement.Controller;

import com.example.migratemate.AssistantManagement.Model.ChatHistory;
import com.example.migratemate.AssistantManagement.Service.AssistantService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/assistant")
@CrossOrigin(origins = "${frontend.url}")
public class AssistantController {

    @Autowired
    private AssistantService assistantService;

    @PostMapping("/chat")
    public ResponseEntity<ChatHistory> chat(@RequestBody Map<String, String> payload) {
        String userId = payload.get("userId");
        String message = payload.get("message");
        return ResponseEntity.ok(assistantService.processChat(userId, message));
    }

    @GetMapping("/history/{userId}")
    public ResponseEntity<List<ChatHistory>> getHistory(@PathVariable String userId) {
        return ResponseEntity.ok(assistantService.getHistory(userId));
    }

    @Autowired
    private com.example.migratemate.AssistantManagement.Service.ChatLimitService chatLimitService;

    @GetMapping("/usage/{userId}")
    public ResponseEntity<Map<String, Object>> getUsage(@PathVariable String userId) {
        return ResponseEntity.ok(chatLimitService.getUsageStats(userId));
    }
}
