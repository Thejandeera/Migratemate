package com.example.migratemate.MailManagement.Event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserRegistrationEvent {

    private String userId;
    private String email;
    private String firstName;
    private String lastName;
    private String fullName;
}