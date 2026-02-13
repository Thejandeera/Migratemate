package com.example.migratemate.MailManagement.Listener;

import com.example.migratemate.MailManagement.Event.UserRegistrationEvent;
import com.example.migratemate.MailManagement.Service.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class UserRegistrationEventListener {

    private final EmailService emailService;

    @Async
    @EventListener
    public void handleUserRegistrationEvent(UserRegistrationEvent event) {
        log.info("📧 Handling user registration event for: {}", event.getEmail());

        try {
            emailService.sendWelcomeEmail(
                    event.getEmail(),
                    event.getFirstName(),
                    event.getFullName()
            );

            log.info("✅ Welcome email queued successfully for: {}", event.getEmail());
        } catch (Exception e) {
            log.error("❌ Failed to handle user registration event for: {}", event.getEmail(), e);
        }
    }
}