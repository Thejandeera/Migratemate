package com.example.migratemate.SosManagement.Service;

import com.example.migratemate.SosManagement.Dto.SosRequest;
import com.example.migratemate.SosManagement.Dto.SosResponse;
import com.example.migratemate.SosManagement.Entity.SosAlert;
import com.example.migratemate.SosManagement.Entity.SosNotification;
import com.example.migratemate.SosManagement.Repository.SosAlertRepository;
import com.example.migratemate.SosManagement.Repository.SosNotificationRepository;
import com.example.migratemate.UserManagement.Entity.User;
import com.example.migratemate.UserManagement.Repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class SosService {

    private final SosAlertRepository sosAlertRepository;
    private final UserRepository userRepository;
    private final SosNotificationRepository sosNotificationRepository;
    private final SimpMessagingTemplate messagingTemplate;

    /**
     * Create SOS Alert and notify all users
     */
    @Transactional
    public SosResponse createSosAlert(String email, SosRequest request) {
        // Get user details
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Check if user already has an active SOS
        sosAlertRepository.findByUserIdAndStatus(user.getId(), "ACTIVE")
                .ifPresent(alert -> {
                    throw new RuntimeException("You already have an active SOS alert");
                });

        // Create SOS Alert
        SosAlert sosAlert = SosAlert.builder()
                .userId(user.getId())
                .userName(user.getFullName())
                .userEmail(user.getEmail())
                .userPhone(user.getPhone())
                .userAvatar(user.getAvatarUrl())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .address(request.getAddress())
                .message(request.getMessage())
                .status("ACTIVE")
                .createdAt(LocalDateTime.now())
                .build();

        sosAlert = sosAlertRepository.save(sosAlert);
        log.info("🚨 SOS Alert created: {} by {}", sosAlert.getId(), user.getEmail());

        // Get all users except the one who triggered SOS
        List<User> allUsers = userRepository.findAll().stream()
                .filter(u -> !u.getId().equals(user.getId()))
                .collect(Collectors.toList());

        // Create SOS notifications for all users (separate from regular notifications)
        for (User recipient : allUsers) {
            SosNotification sosNotification = SosNotification.builder()
                    .userId(recipient.getId())
                    .sosAlertId(sosAlert.getId())
                    .title("🚨 SOS ALERT")
                    .message(user.getFullName() + " needs help! Location: " + request.getAddress())
                    .notificationType("SOS_ALERT")
                    .alertUserName(user.getFullName())
                    .alertUserAvatar(user.getAvatarUrl())
                    .alertLatitude(request.getLatitude())
                    .alertLongitude(request.getLongitude())
                    .alertAddress(request.getAddress())
                    .isRead(false)
                    .createdAt(LocalDateTime.now())
                    .build();

            sosNotificationRepository.save(sosNotification);

            // Send real-time SOS notification via WebSocket
            try {
                messagingTemplate.convertAndSendToUser(
                        recipient.getId(),
                        "/queue/sos-notifications",
                        sosNotification
                );
            } catch (Exception e) {
                log.error("Failed to send WebSocket SOS notification to user: {}", recipient.getId(), e);
            }
        }

        // Broadcast SOS alert to all users via WebSocket
        SosResponse response = mapToResponse(sosAlert);
        messagingTemplate.convertAndSend("/topic/sos-alerts", response);

        log.info("📢 SOS Alert broadcasted to {} users", allUsers.size());

        return response;
    }

    /**
     * Get all active SOS alerts
     */
    public List<SosResponse> getActiveSosAlerts() {
        return sosAlertRepository.findByStatusOrderByCreatedAtDesc("ACTIVE")
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get user's SOS alerts
     */
    public List<SosResponse> getUserSosAlerts(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return sosAlertRepository.findByUserId(user.getId())
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get SOS alert by ID
     */
    public SosResponse getSosAlertById(String id) {
        SosAlert alert = sosAlertRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("SOS Alert not found"));
        return mapToResponse(alert);
    }

    /**
     * Get user's SOS notifications
     */
    public List<SosNotification> getUserSosNotifications(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return sosNotificationRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
    }

    /**
     * Get unread SOS notification count
     */
    public Long getUnreadSosNotificationCount(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return sosNotificationRepository.countByUserIdAndIsRead(user.getId(), false);
    }

    /**
     * Mark SOS notification as read
     */
    @Transactional
    public void markSosNotificationAsRead(String notificationId) {
        SosNotification notification = sosNotificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("SOS Notification not found"));

        notification.setIsRead(true);
        sosNotificationRepository.save(notification);
    }

    /**
     * Mark all SOS notifications as read for a user
     */
    @Transactional
    public void markAllSosNotificationsAsRead(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<SosNotification> notifications = sosNotificationRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
        notifications.forEach(n -> n.setIsRead(true));
        sosNotificationRepository.saveAll(notifications);
    }

    /**
     * Delete SOS notification
     */
    @Transactional
    public void deleteSosNotification(String notificationId) {
        sosNotificationRepository.deleteById(notificationId);
    }

    /**
     * Respond to SOS alert (Mark as helping)
     */
    @Transactional
    public SosResponse respondToSos(String sosId, String helperEmail) {
        SosAlert alert = sosAlertRepository.findById(sosId)
                .orElseThrow(() -> new RuntimeException("SOS Alert not found"));

        User helper = userRepository.findByEmail(helperEmail)
                .orElseThrow(() -> new RuntimeException("Helper not found"));

        if (!alert.getStatus().equals("ACTIVE")) {
            throw new RuntimeException("This SOS alert is no longer active");
        }

        alert.setHelperId(helper.getId());
        alert.setHelperName(helper.getFullName());
        sosAlertRepository.save(alert);

        // Notify the person in distress via SOS notification
        User alertUser = userRepository.findById(alert.getUserId())
                .orElseThrow(() -> new RuntimeException("Alert user not found"));

        SosNotification sosNotification = SosNotification.builder()
                .userId(alertUser.getId())
                .sosAlertId(alert.getId())
                .title("✅ Help is Coming!")
                .message(helper.getFullName() + " is responding to your SOS alert")
                .notificationType("SOS_RESPONSE")
                .alertUserName(helper.getFullName())
                .alertUserAvatar(helper.getAvatarUrl())
                .isRead(false)
                .createdAt(LocalDateTime.now())
                .build();

        sosNotificationRepository.save(sosNotification);

        // Send real-time notification
        messagingTemplate.convertAndSendToUser(
                alertUser.getId(),
                "/queue/sos-notifications",
                sosNotification
        );

        // Broadcast updated SOS
        SosResponse response = mapToResponse(alert);
        messagingTemplate.convertAndSend("/topic/sos-alerts", response);

        log.info("👤 {} is responding to SOS alert {}", helper.getFullName(), sosId);

        return response;
    }

    /**
     * Resolve SOS alert
     */
    @Transactional
    public SosResponse resolveSosAlert(String sosId, String email) {
        SosAlert alert = sosAlertRepository.findById(sosId)
                .orElseThrow(() -> new RuntimeException("SOS Alert not found"));

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Only the creator can resolve their own SOS
        if (!alert.getUserId().equals(user.getId())) {
            throw new RuntimeException("You can only resolve your own SOS alerts");
        }

        alert.setStatus("RESOLVED");
        alert.setResolvedAt(LocalDateTime.now());
        sosAlertRepository.save(alert);

        // Broadcast resolved SOS
        SosResponse response = mapToResponse(alert);
        messagingTemplate.convertAndSend("/topic/sos-alerts", response);

        log.info("✅ SOS Alert resolved: {}", sosId);

        return response;
    }

    /**
     * Cancel SOS alert
     */
    @Transactional
    public void cancelSosAlert(String sosId, String email) {
        SosAlert alert = sosAlertRepository.findById(sosId)
                .orElseThrow(() -> new RuntimeException("SOS Alert not found"));

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!alert.getUserId().equals(user.getId())) {
            throw new RuntimeException("You can only cancel your own SOS alerts");
        }

        alert.setStatus("CANCELLED");
        alert.setResolvedAt(LocalDateTime.now());
        sosAlertRepository.save(alert);

        // Broadcast cancellation
        SosResponse response = mapToResponse(alert);
        messagingTemplate.convertAndSend("/topic/sos-alerts", response);

        log.info("❌ SOS Alert cancelled: {}", sosId);
    }

    /**
     * Map SosAlert entity to SosResponse DTO
     */
    private SosResponse mapToResponse(SosAlert alert) {
        return SosResponse.builder()
                .id(alert.getId())
                .userId(alert.getUserId())
                .userName(alert.getUserName())
                .userEmail(alert.getUserEmail())
                .userPhone(alert.getUserPhone())
                .userAvatar(alert.getUserAvatar())
                .latitude(alert.getLatitude())
                .longitude(alert.getLongitude())
                .address(alert.getAddress())
                .message(alert.getMessage())
                .status(alert.getStatus())
                .createdAt(alert.getCreatedAt())
                .resolvedAt(alert.getResolvedAt())
                .helperId(alert.getHelperId())
                .helperName(alert.getHelperName())
                .build();
    }
}