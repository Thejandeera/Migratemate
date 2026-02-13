package com.example.migratemate.MailManagement.Dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmailDTO {

    private String to;
    private String subject;
    private String templateName;
    private Map<String, Object> variables;

    // For simple text emails
    private String body;

    // For HTML emails
    private String htmlBody;

    // Attachments (optional)
    private Map<String, byte[]> attachments;
}