package com.example.migratemate.ServiceManagement.Entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;

@Document(collection = "services")
@Data
@NoArgsConstructor
@AllArgsConstructor

public class ServiceEntity {
    @Id
    private String id;

    private String title;
    private String description;
    private String category; // e.g., "TRANSPORT", "HOUSING", "DOCUMENTATION", "CULTURAL_SUPPORT"

    // Provider Information
    private String providerId; // Reference to User who is offering the service
    private String providerName;
    private String providerProfilePicture;

    // Location Information
    private String origin; // e.g., "Sri Lanka"
    private String destination; // e.g., "Sydney, Australia"
    private String specificLocation; // More detailed location if needed

    // Pricing
    private Double price;
    private String currency; // e.g., "AUD", "USD"
    private String pricingType; // e.g., "FIXED", "HOURLY", "NEGOTIABLE"

    // Service Details
    private List<String> imageUrls; // Cloudinary URLs
    private List<String> features; // Key features/highlights of the service
    private Integer maxCapacity; // How many people can book this service
    private Integer duration; // Duration in minutes/hours
    private String durationType; // "MINUTES", "HOURS", "DAYS"

    // Availability
    private Boolean isActive;
    private Boolean isAvailable;
    private List<String> availableDays; // e.g., ["MONDAY", "TUESDAY"]
    private String availableTimeSlot; // e.g., "9AM-5PM"

    // Metadata
    private Integer totalBookings;
    private Double averageRating;
    private Integer totalReviews;

    // Status
    private String status; // INREVIEW, APPROVED, ADVICED

    // Timestamps
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}