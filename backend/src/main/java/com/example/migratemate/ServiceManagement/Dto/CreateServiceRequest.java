package com.example.migratemate.ServiceManagement.Dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateServiceRequest {

    private String title;
    private String description;
    private String category; // e.g., "TRANSPORT", "HOUSING", "DOCUMENTATION"

    // Location
    private String origin;
    private String destination;
    private String specificLocation;

    // Pricing
    private Double price;
    private String currency; // e.g., "AUD", "USD"
    private String pricingType; // e.g., "FIXED", "HOURLY", "NEGOTIABLE"

    // Service Details
    private List<String> features;
    private Integer maxCapacity;
    private Integer duration;
    private String durationType; // "MINUTES", "HOURS", "DAYS"

    // Availability
    private List<String> availableDays;
    private String availableTimeSlot;

    // Image URLs (to be populated after upload to Cloudinary)
    private List<String> imageUrls;

    // Base64 encoded images for upload
    private List<String> imagesBase64;
}
