package com.example.migratemate.UserManagement.Dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

// Registration Request DTO
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RegisterRequest {
    private String email;
    private String password;
    private String firstName;
    private String lastName;
    private String phone;
    private String countryOfOrigin;
    private String destinationCountry;

    // Base64 encoded images
    private String avatarBase64;
    private String passportImageBase64;
    private String selfieImageBase64;
    private String otp;
}