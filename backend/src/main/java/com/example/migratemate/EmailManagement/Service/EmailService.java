package com.example.migratemate.EmailManagement.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);
    private final JavaMailSender javaMailSender;

    public EmailService(JavaMailSender javaMailSender) {
        this.javaMailSender = javaMailSender;
    }

    @Async
    public void sendHtmlEmail(String to, String subject, String htmlBody) {
        try {
            MimeMessage message = javaMailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlBody, true); // true indicates HTML

            javaMailSender.send(message);
            log.info("HTML Email sent to {}", to);
        } catch (MessagingException e) {
            log.error("Failed to send HTML email to {}: {}", to, e.getMessage());
            throw new RuntimeException("Failed to send email", e);
        }
    }

    public void sendOtpEmail(String to, String otp) {
        String subject = "Your MigrateMate Verification Code";
        String htmlBody = """
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
                        .container { max-width: 600px; margin: 30px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
                        .header { background-color: #22C55E; color: #ffffff; padding: 20px; text-align: center; }
                        .content { padding: 30px; color: #333333; text-align: center; }
                        .otp-code { font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #22C55E; margin: 20px 0; padding: 10px; background-color: #f0fdf4; border: 2px dashed #22C55E; display: inline-block; border-radius: 8px; }
                        .footer { background-color: #f9fafb; padding: 15px; text-align: center; font-size: 12px; color: #6b7280; border-top: 1px solid #e5e7eb; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>MigrateMate</h1>
                        </div>
                        <div class="content">
                            <h2>Verification Required</h2>
                            <p>Hello,</p>
                            <p>Please use the following One-Time Password (OTP) to verify your email address. This code is valid for 5 minutes.</p>
                            <div class="otp-code">%s</div>
                            <p>If you did not request this code, please ignore this email.</p>
                        </div>
                        <div class="footer">
                            &copy; 2026 MigrateMate. All rights reserved.
                        </div>
                    </div>
                </body>
                </html>
                """
                .formatted(otp);

        sendHtmlEmail(to, subject, htmlBody);
    }

    public void sendRegistrationSuccessEmail(String to, String firstName) {
        String subject = "Welcome to MigrateMate!";
        String htmlBody = """
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
                        .container { max-width: 600px; margin: 30px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
                        .header { background-color: #22C55E; color: #ffffff; padding: 20px; text-align: center; }
                        .content { padding: 30px; color: #333333; text-align: center; }
                        .button { display: inline-block; padding: 12px 24px; background-color: #22C55E; color: #ffffff; text-decoration: none; border-radius: 5px; font-weight: bold; margin-top: 20px; }
                        .footer { background-color: #f9fafb; padding: 15px; text-align: center; font-size: 12px; color: #6b7280; border-top: 1px solid #e5e7eb; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>Welcome to MigrateMate!</h1>
                        </div>
                        <div class="content">
                            <h2>Registration Successful</h2>
                            <p>Hello %s,</p>
                            <p>Congratulations! Your account has been successfully created.</p>
                            <p>We are excited to help you on your migration journey. You can now log in to your account and explore all the features.</p>
                            <a href="#" class="button">Go to Dashboard</a>
                        </div>
                        <div class="footer">
                            &copy; 2026 MigrateMate. All rights reserved.
                        </div>
                    </div>
                </body>
                </html>
                """
                .formatted(firstName);

        sendHtmlEmail(to, subject, htmlBody);
    }
}
