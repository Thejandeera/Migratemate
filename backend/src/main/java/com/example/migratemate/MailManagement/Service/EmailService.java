package com.example.migratemate.MailManagement.Service;

import com.example.migratemate.MailManagement.Dto.EmailDTO;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
@Slf4j
public class EmailService {

    @Value("${sendgrid.api.key:}")
    private String sendGridApiKey;

    @Value("${spring.mail.username:noreply@migratemate.com}")
    private String fromEmail;

    @Value("${app.name:MigrateMate}")
    private String appName;

    private final RestTemplate restTemplate = new RestTemplate();

    /**
     * Send HTML email using SendGrid Web API (works on Render!)
     */
    @Async
    public void sendHtmlEmail(EmailDTO emailDTO) {
        try {
            // Check if API key is configured
            if (sendGridApiKey == null || sendGridApiKey.isEmpty()) {
                log.error("❌ SendGrid API key not configured!");
                return;
            }

            String url = "https://api.sendgrid.com/v3/mail/send";

            // Build request body
            Map<String, Object> requestBody = new HashMap<>();

            // Personalizations
            Map<String, Object> personalization = new HashMap<>();
            personalization.put("to", new Object[] {
                    Map.of("email", emailDTO.getTo())
            });
            requestBody.put("personalizations", new Object[] { personalization });

            // From
            requestBody.put("from", Map.of("email", fromEmail, "name", appName));

            // Subject
            requestBody.put("subject", emailDTO.getSubject());

            // Content
            String contentType = emailDTO.getHtmlBody() != null ? "text/html" : "text/plain";
            String contentValue = emailDTO.getHtmlBody() != null ? emailDTO.getHtmlBody() : emailDTO.getBody();

            requestBody.put("content", new Object[] {
                    Map.of("type", contentType, "value", contentValue)
            });

            // Headers
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Authorization", "Bearer " + sendGridApiKey);

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);

            // Send request
            ResponseEntity<String> response = restTemplate.exchange(
                    url,
                    HttpMethod.POST,
                    request,
                    String.class);

            if (response.getStatusCode().is2xxSuccessful()) {
                log.info("✅ HTML email sent successfully to: {}", emailDTO.getTo());
            } else {
                log.error("❌ SendGrid API returned error: {} - {}", response.getStatusCode(), response.getBody());
            }
        } catch (Exception e) {
            log.error("❌ Failed to send HTML email to: {}", emailDTO.getTo(), e);
        }
    }

    /**
     * Send simple text email
     */
    @Async
    public void sendSimpleEmail(EmailDTO emailDTO) {
        sendHtmlEmail(emailDTO);
    }

    /**
     * Send welcome email to new user
     */
    @Async
    public void sendWelcomeEmail(String email, String firstName, String fullName) {
        try {
            String subject = "Welcome to " + appName + "! 🎉";
            String htmlBody = buildWelcomeEmailTemplate(firstName != null ? firstName : fullName);

            EmailDTO emailDTO = EmailDTO.builder()
                    .to(email)
                    .subject(subject)
                    .htmlBody(htmlBody)
                    .build();

            sendHtmlEmail(emailDTO);
        } catch (Exception e) {
            log.error("❌ Failed to send welcome email to: {}", email, e);
        }
    }

    /**
     * Send verification email
     */
    @Async
    public void sendVerificationEmail(String email, String firstName, String verificationLink) {
        try {
            String subject = "Verify Your " + appName + " Account";
            String htmlBody = buildVerificationEmailTemplate(
                    firstName != null ? firstName : "User",
                    verificationLink);

            EmailDTO emailDTO = EmailDTO.builder()
                    .to(email)
                    .subject(subject)
                    .htmlBody(htmlBody)
                    .build();

            sendHtmlEmail(emailDTO);
        } catch (Exception e) {
            log.error("❌ Failed to send verification email to: {}", email, e);
        }
    }

    /**
     * Send password reset email
     */
    @Async
    public void sendPasswordResetEmail(String email, String firstName, String resetLink) {
        try {
            String subject = "Reset Your " + appName + " Password";
            String htmlBody = buildPasswordResetEmailTemplate(
                    firstName != null ? firstName : "User",
                    resetLink);

            EmailDTO emailDTO = EmailDTO.builder()
                    .to(email)
                    .subject(subject)
                    .htmlBody(htmlBody)
                    .build();

            sendHtmlEmail(emailDTO);
        } catch (Exception e) {
            log.error("❌ Failed to send password reset email to: {}", email, e);
        }
    }

    /**
     * Build welcome email HTML template
     */
    private String buildWelcomeEmailTemplate(String name) {
        return "<!DOCTYPE html>" +
                "<html>" +
                "<head>" +
                "    <meta charset='UTF-8'>" +
                "    <meta name='viewport' content='width=device-width, initial-scale=1.0'>" +
                "    <style>" +
                "        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; margin: 0; padding: 0; }"
                +
                "        .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); overflow: hidden; }"
                +
                "        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 20px; text-align: center; }"
                +
                "        .header h1 { margin: 0; font-size: 28px; font-weight: 600; }" +
                "        .content { padding: 40px 30px; }" +
                "        .content h2 { color: #667eea; margin-top: 0; }" +
                "        .content p { margin: 15px 0; color: #555; }" +
                "        .button { display: inline-block; padding: 12px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: 600; }"
                +
                "        .features { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }" +
                "        .features ul { list-style: none; padding: 0; margin: 0; }" +
                "        .features li { padding: 8px 0; color: #555; }" +
                "        .features li:before { content: '✓ '; color: #667eea; font-weight: bold; margin-right: 10px; }"
                +
                "        .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #777; font-size: 14px; }"
                +
                "    </style>" +
                "</head>" +
                "<body>" +
                "    <div class='container'>" +
                "        <div class='header'>" +
                "            <h1>Welcome to " + appName + "! 🎉</h1>" +
                "        </div>" +
                "        <div class='content'>" +
                "            <h2>Hello " + name + "!</h2>" +
                "            <p>We're thrilled to have you join our community of migrants and helpers making relocation easier and more connected.</p>"
                +
                "            <p>Your journey to a seamless migration experience starts here!</p>" +
                "            <div class='features'>" +
                "                <h3>What you can do with " + appName + ":</h3>" +
                "                <ul>" +
                "                    <li>Connect with verified helpers in your destination country</li>" +
                "                    <li>Join community groups and share experiences</li>" +
                "                    <li>Access essential services and resources</li>" +
                "                    <li>Get real-time assistance and support</li>" +
                "                    <li>Share your journey and help others</li>" +
                "                </ul>" +
                "            </div>" +
                "            <p>Complete your profile to unlock all features and start connecting with the community!</p>"
                +
                "            <p>If you have any questions, our support team is here to help. Just reply to this email!</p>"
                +
                "            <p>Happy migrating! 🌍✈️</p>" +
                "            <p style='margin-top: 30px;'><strong>The " + appName + " Team</strong></p>" +
                "        </div>" +
                "        <div class='footer'>" +
                "            <p>&copy; 2024 " + appName + ". All rights reserved.</p>" +
                "            <p>You're receiving this email because you signed up for " + appName + ".</p>" +
                "        </div>" +
                "    </div>" +
                "</body>" +
                "</html>";
    }

    /**
     * Build verification email HTML template
     */
    private String buildVerificationEmailTemplate(String name, String verificationLink) {
        return "<!DOCTYPE html>" +
                "<html>" +
                "<head>" +
                "    <meta charset='UTF-8'>" +
                "    <style>" +
                "        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }" +
                "        .container { max-width: 600px; margin: 0 auto; padding: 20px; }" +
                "        .header { background: #667eea; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }"
                +
                "        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 5px 5px; }" +
                "        .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }"
                +
                "        .footer { text-align: center; margin-top: 20px; color: #777; font-size: 12px; }" +
                "    </style>" +
                "</head>" +
                "<body>" +
                "    <div class='container'>" +
                "        <div class='header'><h1>Verify Your Email</h1></div>" +
                "        <div class='content'>" +
                "            <p>Hello " + name + ",</p>" +
                "            <p>Thank you for registering with " + appName
                + ". Please verify your email address to activate your account.</p>" +
                "            <center><a href='" + verificationLink
                + "' class='button'>Verify Email Address</a></center>" +
                "            <p>Or copy and paste this link in your browser:</p>" +
                "            <p style='word-break: break-all; color: #667eea;'>" + verificationLink + "</p>" +
                "            <p>This link will expire in 24 hours.</p>" +
                "            <p>If you didn't create an account, please ignore this email.</p>" +
                "        </div>" +
                "        <div class='footer'><p>&copy; 2024 " + appName + "</p></div>" +
                "    </div>" +
                "</body>" +
                "</html>";
    }

    /**
     * Build password reset email HTML template
     */
    private String buildPasswordResetEmailTemplate(String name, String resetLink) {
        return "<!DOCTYPE html>" +
                "<html>" +
                "<head>" +
                "    <meta charset='UTF-8'>" +
                "    <style>" +
                "        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }" +
                "        .container { max-width: 600px; margin: 0 auto; padding: 20px; }" +
                "        .header { background: #667eea; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }"
                +
                "        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 5px 5px; }" +
                "        .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }"
                +
                "        .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }"
                +
                "        .footer { text-align: center; margin-top: 20px; color: #777; font-size: 12px; }" +
                "    </style>" +
                "</head>" +
                "<body>" +
                "    <div class='container'>" +
                "        <div class='header'><h1>Password Reset Request</h1></div>" +
                "        <div class='content'>" +
                "            <p>Hello " + name + ",</p>" +
                "            <p>We received a request to reset your password for your " + appName + " account.</p>" +
                "            <center><a href='" + resetLink + "' class='button'>Reset Password</a></center>" +
                "            <p>Or copy and paste this link in your browser:</p>" +
                "            <p style='word-break: break-all; color: #667eea;'>" + resetLink + "</p>" +
                "            <div class='warning'>" +
                "                <strong>⚠️ Security Notice:</strong> This link will expire in 1 hour. If you didn't request this password reset, please ignore this email or contact support if you have concerns."
                +
                "            </div>" +
                "        </div>" +
                "        <div class='footer'><p>&copy; 2024 " + appName + "</p></div>" +
                "    </div>" +
                "</body>" +
                "</html>";
    }

    /**
     * Send OTP email
     */
    @Async
    public void sendOtpEmail(String email, String otp) {
        try {
            String subject = "Your Verification Code - " + appName;
            String htmlBody = buildOtpEmailTemplate(otp);

            EmailDTO emailDTO = EmailDTO.builder()
                    .to(email)
                    .subject(subject)
                    .htmlBody(htmlBody)
                    .build();

            sendHtmlEmail(emailDTO);
        } catch (Exception e) {
            log.error("❌ Failed to send OTP email to: {}", email, e);
        }
    }

    /**
     * Build OTP email HTML template
     */
    private String buildOtpEmailTemplate(String otp) {
        return "<!DOCTYPE html>" +
                "<html>" +
                "<head>" +
                "    <meta charset='UTF-8'>" +
                "    <style>" +
                "        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }" +
                "        .container { max-width: 600px; margin: 0 auto; padding: 20px; text-align: center; }" +
                "        .header { background: #667eea; color: white; padding: 20px; border-radius: 5px 5px 0 0; }" +
                "        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 5px 5px; }" +
                "        .otp { font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #667eea; margin: 20px 0; background: #fff; padding: 15px; border-radius: 5px; display: inline-block; }"
                +
                "        .footer { margin-top: 20px; color: #777; font-size: 12px; }" +
                "    </style>" +
                "</head>" +
                "<body>" +
                "    <div class='container'>" +
                "        <div class='header'><h1>Verification Code</h1></div>" +
                "        <div class='content'>" +
                "            <p>Use the following code to verify your email address:</p>" +
                "            <div class='otp'>" + otp + "</div>" +
                "            <p>This code will expire in 10 minutes.</p>" +
                "            <p>If you didn't request this code, please ignore this email.</p>" +
                "        </div>" +
                "        <div class='footer'><p>&copy; 2024 " + appName + "</p></div>" +
                "    </div>" +
                "</body>" +
                "</html>";
    }

    /**
     * Send service deletion email
     */
    @Async
    public void sendServiceDeletionEmail(String email, String serviceTitle, String reason) {
        try {
            String subject = "Service Deletion Notification - " + appName;
            String htmlBody = buildServiceDeletionEmailTemplate(serviceTitle, reason);

            EmailDTO emailDTO = EmailDTO.builder()
                    .to(email)
                    .subject(subject)
                    .htmlBody(htmlBody)
                    .build();

            sendHtmlEmail(emailDTO);
        } catch (Exception e) {
            log.error("❌ Failed to send service deletion email to: {}", email, e);
        }
    }

    /**
     * Build service deletion email HTML template
     */
    private String buildServiceDeletionEmailTemplate(String serviceTitle, String reason) {
        return "<!DOCTYPE html>" +
                "<html>" +
                "<head>" +
                "    <meta charset='UTF-8'>" +
                "    <style>" +
                "        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }" +
                "        .container { max-width: 600px; margin: 0 auto; padding: 20px; }" +
                "        .header { background: #e53e3e; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }"
                +
                "        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 5px 5px; }" +
                "        .reason-box { background: #fff; border-left: 4px solid #e53e3e; padding: 15px; margin: 20px 0; font-style: italic; color: #555; }"
                +
                "        .footer { text-align: center; margin-top: 20px; color: #777; font-size: 12px; }" +
                "    </style>" +
                "</head>" +
                "<body>" +
                "    <div class='container'>" +
                "        <div class='header'><h1>Service Removed</h1></div>" +
                "        <div class='content'>" +
                "            <p>Hello,</p>" +
                "            <p>We are writing to inform you that your service <strong>" + serviceTitle
                + "</strong> has been removed from " + appName + " by an administrator.</p>" +
                "            <p><strong>Reason for deletion:</strong></p>" +
                "            <div class='reason-box'>" +
                "                \"" + reason + "\"" +
                "            </div>" +
                "            <p>If you believe this was a mistake or have any questions, please contact our support team.</p>"
                +
                "        </div>" +
                "        <div class='footer'><p>&copy; 2024 " + appName + "</p></div>" +
                "    </div>" +
                "</body>" +
                "</html>";
    }
}