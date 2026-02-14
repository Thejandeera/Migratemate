package com.example.migratemate.SosManagement.Controller;

import com.example.migratemate.SosManagement.Entity.SosNotification;
import com.example.migratemate.SosManagement.Service.SosService;
import com.example.migratemate.UserManagement.Dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sos-notifications")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class SosNotificationController {

    private final SosService sosService;

    /**
     * Get user's SOS notifications
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<SosNotification>>> getUserSosNotifications() {
        try {
            String email = getCurrentUserEmail();
            List<SosNotification> notifications = sosService.getUserSosNotifications(email);

            return ResponseEntity.ok(ApiResponse.<List<SosNotification>>builder()
                    .success(true)
                    .message("SOS notifications retrieved")
                    .data(notifications)
                    .build());
        } catch (Exception e) {
            log.error("Failed to get SOS notifications", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.<List<SosNotification>>builder()
                            .success(false)
                            .message("Failed to retrieve SOS notifications")
                            .build());
        }
    }

    /**
     * Get unread SOS notification count
     */
    @GetMapping("/unread-count")
    public ResponseEntity<ApiResponse<Long>> getUnreadCount() {
        try {
            String email = getCurrentUserEmail();
            Long count = sosService.getUnreadSosNotificationCount(email);

            return ResponseEntity.ok(ApiResponse.<Long>builder()
                    .success(true)
                    .message("Unread count retrieved")
                    .data(count)
                    .build());
        } catch (Exception e) {
            log.error("Failed to get unread count", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.<Long>builder()
                            .success(false)
                            .message("Failed to retrieve unread count")
                            .build());
        }
    }

    /**
     * Mark SOS notification as read
     */
    @PutMapping("/{notificationId}/read")
    public ResponseEntity<ApiResponse<Void>> markAsRead(@PathVariable String notificationId) {
        try {
            sosService.markSosNotificationAsRead(notificationId);

            return ResponseEntity.ok(ApiResponse.<Void>builder()
                    .success(true)
                    .message("SOS notification marked as read")
                    .build());
        } catch (Exception e) {
            log.error("Failed to mark SOS notification as read", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.<Void>builder()
                            .success(false)
                            .message("Failed to mark as read")
                            .build());
        }
    }

    /**
     * Mark all SOS notifications as read
     */
    @PutMapping("/read-all")
    public ResponseEntity<ApiResponse<Void>> markAllAsRead() {
        try {
            String email = getCurrentUserEmail();
            sosService.markAllSosNotificationsAsRead(email);

            return ResponseEntity.ok(ApiResponse.<Void>builder()
                    .success(true)
                    .message("All SOS notifications marked as read")
                    .build());
        } catch (Exception e) {
            log.error("Failed to mark all SOS notifications as read", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.<Void>builder()
                            .success(false)
                            .message("Failed to mark all as read")
                            .build());
        }
    }

    /**
     * Delete SOS notification
     */
    @DeleteMapping("/{notificationId}")
    public ResponseEntity<ApiResponse<Void>> deleteSosNotification(@PathVariable String notificationId) {
        try {
            sosService.deleteSosNotification(notificationId);

            return ResponseEntity.ok(ApiResponse.<Void>builder()
                    .success(true)
                    .message("SOS notification deleted")
                    .build());
        } catch (Exception e) {
            log.error("Failed to delete SOS notification", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.<Void>builder()
                            .success(false)
                            .message("Failed to delete notification")
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