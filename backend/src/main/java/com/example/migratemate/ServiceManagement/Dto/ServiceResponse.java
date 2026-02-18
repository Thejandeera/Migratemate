package com.example.migratemate.ServiceManagement.Dto;

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
public class ServiceResponse {

    private String id;
    private String title;
    private String description;
    private String category;

    // Provider Information
    private String providerId;
    private String providerName;
    private String providerProfilePicture;

    // Location Information
    private String origin;
    private String destination;
    private String specificLocation;

    // Pricing
    private Double price;
    private String currency;
    private String pricingType;

    // Service Details
    private List<String> imageUrls;
    private List<String> features;
    private Integer maxCapacity;
    private Integer duration;
    private String durationType;

    // Availability
    private Boolean isActive;
    private Boolean isAvailable;
    private List<String> availableDays;
    private String availableTimeSlot;

    // Metadata
    private Integer totalBookings;
    private Double averageRating;
    private Integer totalReviews;

    // Status
    private String status;

    // Timestamps
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
