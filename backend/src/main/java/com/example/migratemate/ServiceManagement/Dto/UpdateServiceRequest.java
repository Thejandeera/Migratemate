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
public class UpdateServiceRequest {

    private String title;
    private String description;
    private String category;

    // Location
    private String origin;
    private String destination;
    private String specificLocation;

    // Pricing
    private Double price;
    private String currency;
    private String pricingType;

    // Service Details
    private List<String> features;
    private Integer maxCapacity;
    private Integer duration;
    private String durationType;

    // Availability
    private Boolean isActive;
    private Boolean isAvailable;
    private List<String> availableDays;
    private String availableTimeSlot;

    // New image URLs to add (after Cloudinary upload)
    private List<String> newImageUrls;

    // Base64 encoded images for upload
    private List<String> newImagesBase64;

    // Image URLs to remove
    private List<String> removeImageUrls;
}
