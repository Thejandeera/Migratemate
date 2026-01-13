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
public class UserResponse {
    private String id;
    private String email;
    private String firstName;
    private String lastName;
    private String fullName;
    private String avatarUrl;
    private String bio;
    private String location;
    private String phone;
    private List<String> skills;
    private List<String> languages;
    private String countryOfOrigin;
    private String destinationCountry;
    private String passportImageUrl;
    private String selfieImageUrl;
    private Boolean isVerified;
    private Boolean isHelper;
    private Double rating;
    private Integer totalReviews;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
