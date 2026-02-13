package com.example.migratemate.MailManagement.Service;

import com.example.migratemate.MailManagement.Dto.EmailDTO;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.core.io.ByteArrayResource;

import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Value("${app.name:MigrateMate}")
    private String appName;

    /**
     * Send simple text email
     */
    @Async
    public void sendSimpleEmail(EmailDTO emailDTO) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(emailDTO.getTo());
            message.setSubject(emailDTO.getSubject());
            message.setText(emailDTO.getBody());

            mailSender.send(message);
            log.info("✅ Simple email sent successfully to: {}", emailDTO.getTo());
        } catch (Exception e) {
            log.error("❌ Failed to send simple email to: {}", emailDTO.getTo(), e);
        }
    }

    /**
     * Send HTML email
     */
    @Async
    public void sendHtmlEmail(EmailDTO emailDTO) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(emailDTO.getTo());
            helper.setSubject(emailDTO.getSubject());
            helper.setText(emailDTO.getHtmlBody(), true);

            // Add attachments if any
            if (emailDTO.getAttachments() != null && !emailDTO.getAttachments().isEmpty()) {
                for (Map.Entry<String, byte[]> entry : emailDTO.getAttachments().entrySet()) {
                    helper.addAttachment(entry.getKey(), new ByteArrayResource(entry.getValue()));
                }
            }

            mailSender.send(message);
            log.info("✅ HTML email sent successfully to: {}", emailDTO.getTo());
        } catch (MessagingException e) {
            log.error("❌ Failed to send HTML email to: {}", emailDTO.getTo(), e);
        }
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
                    verificationLink
            );

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
                    resetLink
            );

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
                "        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; margin: 0; padding: 0; }" +
                "        .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); overflow: hidden; }" +
                "        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 20px; text-align: center; }" +
                "        .header h1 { margin: 0; font-size: 28px; font-weight: 600; }" +
                "        .content { padding: 40px 30px; }" +
                "        .content h2 { color: #667eea; margin-top: 0; }" +
                "        .content p { margin: 15px 0; color: #555; }" +
                "        .button { display: inline-block; padding: 12px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: 600; }" +
                "        .features { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }" +
                "        .features ul { list-style: none; padding: 0; margin: 0; }" +
                "        .features li { padding: 8px 0; color: #555; }" +
                "        .features li:before { content: '✓ '; color: #667eea; font-weight: bold; margin-right: 10px; }" +
                "        .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #777; font-size: 14px; }" +
                "    </style>" +
                "</head>" +
                "<body>" +
                "    <div class='container'>" +
                "        <div class='header'>" +
                "            <h1>Welcome to " + appName + "! 🎉</h1>" +
                "        </div>" +
                "        <div class='content'>" +
                "            <h2>Hello " + name + "!</h2>" +
                "            <p>We're thrilled to have you join our community of migrants and helpers making relocation easier and more connected.</p>" +
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
                "            <p>Complete your profile to unlock all features and start connecting with the community!</p>" +
                "            <center>" +
                "                <a href='#' class='button'>Complete Your Profile</a>" +
                "            </center>" +
                "            <p>If you have any questions, our support team is here to help. Just reply to this email!</p>" +
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
                "        .header { background: #667eea; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }" +
                "        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 5px 5px; }" +
                "        .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }" +
                "        .footer { text-align: center; margin-top: 20px; color: #777; font-size: 12px; }" +
                "    </style>" +
                "</head>" +
                "<body>" +
                "    <div class='container'>" +
                "        <div class='header'><h1>Verify Your Email</h1></div>" +
                "        <div class='content'>" +
                "            <p>Hello " + name + ",</p>" +
                "            <p>Thank you for registering with " + appName + ". Please verify your email address to activate your account.</p>" +
                "            <center><a href='" + verificationLink + "' class='button'>Verify Email Address</a></center>" +
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
                "        .header { background: #667eea; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }" +
                "        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 5px 5px; }" +
                "        .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }" +
                "        .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }" +
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
                "                <strong>⚠️ Security Notice:</strong> This link will expire in 1 hour. If you didn't request this password reset, please ignore this email or contact support if you have concerns." +
                "            </div>" +
                "        </div>" +
                "        <div class='footer'><p>&copy; 2024 " + appName + "</p></div>" +
                "    </div>" +
                "</body>" +
                "</html>";
    }
}