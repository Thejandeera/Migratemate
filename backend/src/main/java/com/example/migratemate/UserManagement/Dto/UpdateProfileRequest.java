package com.example.migratemate.UserManagement.Dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateProfileRequest {
    private String firstName;
    private String lastName;
    private String bio;
    private String location;
    private String phone;
    private List<String> skills;
    private List<String> languages;
    private String countryOfOrigin;
    private String destinationCountry;

    // Base64 encoded images (optional)
    private String avatarBase64;
    private String passportImageBase64;
    private String selfieImageBase64;
}
