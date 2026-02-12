package com.example.migratemate.UserManagement.Entity;



import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "profiles")
public class User {

    @Id
    private String id;

    @Indexed(unique = true)
    private String email;

    private String password;

    private String firstName;

    private String lastName;

    private String fullName; // Auto-generated from firstName + lastName

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

    // Location tracking
    private Double longitude;

    private Double latitude;

    private LocalDateTime locationUpdatedAt;

    @Builder.Default
    private Boolean isVerified = false;

    @Builder.Default
    private Boolean isHelper = false;

    @Builder.Default
    private Double rating = 0.0;

    @Builder.Default
    private Integer totalReviews = 0;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();

    // Method to auto-generate full name
    public void generateFullName() {
        if (firstName != null && lastName != null) {
            this.fullName = firstName + " " + lastName;
        } else if (firstName != null) {
            this.fullName = firstName;
        } else if (lastName != null) {
            this.fullName = lastName;
        }
    }

    // Update timestamp before save
    public void updateTimestamp() {
        this.updatedAt = LocalDateTime.now();
    }


}