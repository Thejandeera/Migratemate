package com.example.migratemate.CommunityManagement.Controller;

import com.example.migratemate.CommunityManagement.Dto.MessageRequest;
import com.example.migratemate.CommunityManagement.Dto.MessageResponse;
import com.example.migratemate.CommunityManagement.Service.MessageService;
import com.example.migratemate.UserManagement.Dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/messages")
@RequiredArgsConstructor
@Slf4j
public class MessageController {

    private final MessageService messageService;

    /**
     * Send a message
     */
    @PostMapping
    public ResponseEntity<ApiResponse<MessageResponse>> sendMessage(@RequestBody MessageRequest request) {
        try {
            String email = getCurrentUserEmail();
            MessageResponse message = messageService.sendMessage(request, email);
            return ResponseEntity.ok(ApiResponse.<MessageResponse>builder()
                    .success(true)
                    .message("Message sent successfully")
                    .data(message)
                    .build());
        } catch (IllegalArgumentException e) {
            log.error("Failed to send message: {}", e.getMessage());
            return ResponseEntity.badRequest().body(ApiResponse.<MessageResponse>builder()
                    .success(false)
                    .message(e.getMessage())
                    .build());
        } catch (IOException e) {
            log.error("File upload failed during message send", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.<MessageResponse>builder()
                            .success(false)
                            .message("Failed to upload file: " + e.getMessage())
                            .build());
        } catch (Exception e) {
            log.error("Failed to send message: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.<MessageResponse>builder()
                            .success(false)
                            .message("Failed to send message: " + e.getMessage())
                            .build());
        }
    }

    /**
     * Get community messages (chat history)
     */
    @GetMapping("/community/{communityId}")
    public ResponseEntity<ApiResponse<List<MessageResponse>>> getCommunityMessages(
            @PathVariable String communityId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        try {
            String email = getCurrentUserEmail();
            List<MessageResponse> messages = messageService.getCommunityMessages(communityId, email, page, size);
            return ResponseEntity.ok(ApiResponse.<List<MessageResponse>>builder()
                    .success(true)
                    .message("Messages retrieved successfully")
                    .data(messages)
                    .build());
        } catch (IllegalArgumentException e) {
            log.error("Failed to get messages: {}", e.getMessage());
            return ResponseEntity.badRequest().body(ApiResponse.<List<MessageResponse>>builder()
                    .success(false)
                    .message(e.getMessage())
                    .build());
        } catch (Exception e) {
            log.error("Failed to get community messages: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.<List<MessageResponse>>builder()
                            .success(false)
                            .message("Failed to retrieve messages: " + e.getMessage())
                            .build());
        }
    }

    /**
     * Get direct messages between two users
     */
    @GetMapping("/direct/{otherUserId}")
    public ResponseEntity<ApiResponse<List<MessageResponse>>> getDirectMessages(
            @PathVariable String otherUserId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        try {
            String email = getCurrentUserEmail();
            List<MessageResponse> messages = messageService.getDirectMessages(otherUserId, email, page, size);
            return ResponseEntity.ok(ApiResponse.<List<MessageResponse>>builder()
                    .success(true)
                    .message("Direct messages retrieved successfully")
                    .data(messages)
                    .build());
        } catch (Exception e) {
            log.error("Failed to get direct messages: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.<List<MessageResponse>>builder()
                            .success(false)
                            .message("Failed to retrieve messages: " + e.getMessage())
                            .build());
        }
    }

    /**
     * Edit a message
     */
    @PutMapping("/{messageId}")
    public ResponseEntity<ApiResponse<MessageResponse>> editMessage(
            @PathVariable String messageId,
            @RequestBody MessageRequest request) {
        try {
            String email = getCurrentUserEmail();
            MessageResponse message = messageService.editMessage(messageId, request.getContent(), email);
            return ResponseEntity.ok(ApiResponse.<MessageResponse>builder()
                    .success(true)
                    .message("Message edited successfully")
                    .data(message)
                    .build());
        } catch (IllegalArgumentException e) {
            log.error("Failed to edit message: {}", e.getMessage());
            return ResponseEntity.badRequest().body(ApiResponse.<MessageResponse>builder()
                    .success(false)
                    .message(e.getMessage())
                    .build());
        } catch (Exception e) {
            log.error("Failed to edit message: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.<MessageResponse>builder()
                            .success(false)
                            .message("Failed to edit message: " + e.getMessage())
                            .build());
        }
    }

    /**
     * Delete a message
     */
    @DeleteMapping("/{messageId}")
    public ResponseEntity<ApiResponse<Void>> deleteMessage(@PathVariable String messageId) {
        try {
            String email = getCurrentUserEmail();
            messageService.deleteMessage(messageId, email);
            return ResponseEntity.ok(ApiResponse.<Void>builder()
                    .success(true)
                    .message("Message deleted successfully")
                    .build());
        } catch (IllegalArgumentException e) {
            log.error("Failed to delete message: {}", e.getMessage());
            return ResponseEntity.badRequest().body(ApiResponse.<Void>builder()
                    .success(false)
                    .message(e.getMessage())
                    .build());
        } catch (Exception e) {
            log.error("Failed to delete message: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.<Void>builder()
                            .success(false)
                            .message("Failed to delete message: " + e.getMessage())
                            .build());
        }
    }

    /**
     * Get current authenticated user's email
     */
    private String getCurrentUserEmail() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new IllegalStateException("User not authenticated");
        }
        return authentication.getName();
    }
}