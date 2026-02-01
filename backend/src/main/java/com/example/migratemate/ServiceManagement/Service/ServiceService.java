package com.example.migratemate.ServiceManagement.Service;

import com.example.migratemate.ServiceManagement.Dto.*;
import com.example.migratemate.ServiceManagement.Entity.ServiceEntity;
import com.example.migratemate.ServiceManagement.Repository.ServiceRepository;
import com.example.migratemate.UserManagement.Entity.User;
import com.example.migratemate.UserManagement.Repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ServiceService {

    private final ServiceRepository serviceRepository;
    private final UserRepository userRepository;

    // Create a new service
    public ServiceResponse createService(String email, CreateServiceRequest request) {
        User provider = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        ServiceEntity service = new ServiceEntity();
        service.setTitle(request.getTitle());
        service.setDescription(request.getDescription());
        service.setCategory(request.getCategory());

        // Provider info
        service.setProviderId(provider.getId());
        service.setProviderName(provider.getFullName() != null ? provider.getFullName() : provider.getFirstName());
        service.setProviderProfilePicture(provider.getAvatarUrl());

        // Location
        service.setOrigin(request.getOrigin());
        service.setDestination(request.getDestination());
        service.setSpecificLocation(request.getSpecificLocation());

        // Pricing
        service.setPrice(request.getPrice());
        service.setCurrency(request.getCurrency() != null ? request.getCurrency() : "AUD");
        service.setPricingType(request.getPricingType() != null ? request.getPricingType() : "FIXED");

        // Service details - use imageUrls directly (to be implemented later)
        service.setImageUrls(request.getImageUrls());
        service.setFeatures(request.getFeatures());
        service.setMaxCapacity(request.getMaxCapacity());
        service.setDuration(request.getDuration());
        service.setDurationType(request.getDurationType());

        // Availability
        service.setIsActive(true);
        service.setIsAvailable(true);
        service.setAvailableDays(request.getAvailableDays());
        service.setAvailableTimeSlot(request.getAvailableTimeSlot());

        // Metadata
        service.setTotalBookings(0);
        service.setAverageRating(0.0);
        service.setTotalReviews(0);

        // Timestamps
        service.setCreatedAt(LocalDateTime.now());
        service.setUpdatedAt(LocalDateTime.now());

        ServiceEntity savedService = serviceRepository.save(service);
        log.info("Service created successfully with id: {}", savedService.getId());

        return mapToResponse(savedService);
    }

    // Update an existing service
    public ServiceResponse updateService(String serviceId, String email, UpdateServiceRequest request) {
        ServiceEntity service = serviceRepository.findById(serviceId)
                .orElseThrow(() -> new RuntimeException("Service not found"));

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Verify ownership
        if (!service.getProviderId().equals(user.getId())) {
            throw new RuntimeException("You are not authorized to update this service");
        }

        // Update fields if provided
        if (request.getTitle() != null)
            service.setTitle(request.getTitle());
        if (request.getDescription() != null)
            service.setDescription(request.getDescription());
        if (request.getCategory() != null)
            service.setCategory(request.getCategory());
        if (request.getOrigin() != null)
            service.setOrigin(request.getOrigin());
        if (request.getDestination() != null)
            service.setDestination(request.getDestination());
        if (request.getSpecificLocation() != null)
            service.setSpecificLocation(request.getSpecificLocation());
        if (request.getPrice() != null)
            service.setPrice(request.getPrice());
        if (request.getCurrency() != null)
            service.setCurrency(request.getCurrency());
        if (request.getPricingType() != null)
            service.setPricingType(request.getPricingType());
        if (request.getFeatures() != null)
            service.setFeatures(request.getFeatures());
        if (request.getMaxCapacity() != null)
            service.setMaxCapacity(request.getMaxCapacity());
        if (request.getDuration() != null)
            service.setDuration(request.getDuration());
        if (request.getDurationType() != null)
            service.setDurationType(request.getDurationType());
        if (request.getIsActive() != null)
            service.setIsActive(request.getIsActive());
        if (request.getIsAvailable() != null)
            service.setIsAvailable(request.getIsAvailable());
        if (request.getAvailableDays() != null)
            service.setAvailableDays(request.getAvailableDays());
        if (request.getAvailableTimeSlot() != null)
            service.setAvailableTimeSlot(request.getAvailableTimeSlot());

        // Handle image URL updates
        List<String> currentImages = service.getImageUrls() != null ? new ArrayList<>(service.getImageUrls())
                : new ArrayList<>();

        // Remove specified images
        if (request.getRemoveImageUrls() != null && !request.getRemoveImageUrls().isEmpty()) {
            currentImages.removeAll(request.getRemoveImageUrls());
        }

        // Add new image URLs directly (to be implemented later)
        if (request.getNewImageUrls() != null && !request.getNewImageUrls().isEmpty()) {
            currentImages.addAll(request.getNewImageUrls());
        }

        service.setImageUrls(currentImages);
        service.setUpdatedAt(LocalDateTime.now());

        ServiceEntity updatedService = serviceRepository.save(service);
        log.info("Service updated successfully: {}", updatedService.getId());

        return mapToResponse(updatedService);
    }

    // Delete a service
    public void deleteService(String serviceId, String email) {
        ServiceEntity service = serviceRepository.findById(serviceId)
                .orElseThrow(() -> new RuntimeException("Service not found"));

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Verify ownership
        if (!service.getProviderId().equals(user.getId())) {
            throw new RuntimeException("You are not authorized to delete this service");
        }

        serviceRepository.delete(service);
        log.info("Service deleted successfully: {}", serviceId);
    }

    // Get service by ID
    public ServiceResponse getServiceById(String serviceId) {
        ServiceEntity service = serviceRepository.findById(serviceId)
                .orElseThrow(() -> new RuntimeException("Service not found"));
        return mapToResponse(service);
    }

    // Get all active services
    public List<ServiceResponse> getAllServices() {
        return serviceRepository.findByIsActiveTrue()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // Get services by provider
    public List<ServiceResponse> getServicesByProvider(String providerId) {
        return serviceRepository.findByProviderId(providerId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // Get services by current user (provider)
    public List<ServiceResponse> getMyServices(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return getServicesByProvider(user.getId());
    }

    // Search services with filters
    public List<ServiceResponse> searchServices(ServiceSearchRequest request) {
        List<ServiceEntity> results;

        // If search term is provided, use keyword search
        if (request.getSearchTerm() != null && !request.getSearchTerm().isEmpty()) {
            results = serviceRepository.searchByKeyword(request.getSearchTerm());
        } else {
            // Use filter search
            results = serviceRepository.searchWithFilters(
                    request.getCategory(),
                    request.getOrigin(),
                    request.getDestination());
        }

        // Apply additional filters in memory
        return results.stream()
                .filter(s -> {
                    // Price range filter
                    if (request.getMinPrice() != null && s.getPrice() != null && s.getPrice() < request.getMinPrice()) {
                        return false;
                    }
                    if (request.getMaxPrice() != null && s.getPrice() != null && s.getPrice() > request.getMaxPrice()) {
                        return false;
                    }
                    // Pricing type filter
                    if (request.getPricingType() != null && !request.getPricingType().equals(s.getPricingType())) {
                        return false;
                    }
                    // Available only filter
                    if (Boolean.TRUE.equals(request.getAvailableOnly()) && !Boolean.TRUE.equals(s.getIsAvailable())) {
                        return false;
                    }
                    return true;
                })
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // Toggle service availability
    public ServiceResponse toggleServiceAvailability(String serviceId, String email) {
        ServiceEntity service = serviceRepository.findById(serviceId)
                .orElseThrow(() -> new RuntimeException("Service not found"));

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Verify ownership
        if (!service.getProviderId().equals(user.getId())) {
            throw new RuntimeException("You are not authorized to update this service");
        }

        service.setIsAvailable(!Boolean.TRUE.equals(service.getIsAvailable()));
        service.setUpdatedAt(LocalDateTime.now());

        ServiceEntity updatedService = serviceRepository.save(service);
        log.info("Service availability toggled: {} -> {}", serviceId, updatedService.getIsAvailable());

        return mapToResponse(updatedService);
    }

    // Get services by category
    public List<ServiceResponse> getServicesByCategory(String category) {
        return serviceRepository.findByCategoryAndIsActiveTrue(category)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private ServiceResponse mapToResponse(ServiceEntity entity) {
        return ServiceResponse.builder()
                .id(entity.getId())
                .title(entity.getTitle())
                .description(entity.getDescription())
                .category(entity.getCategory())
                .providerId(entity.getProviderId())
                .providerName(entity.getProviderName())
                .providerProfilePicture(entity.getProviderProfilePicture())
                .origin(entity.getOrigin())
                .destination(entity.getDestination())
                .specificLocation(entity.getSpecificLocation())
                .price(entity.getPrice())
                .currency(entity.getCurrency())
                .pricingType(entity.getPricingType())
                .imageUrls(entity.getImageUrls())
                .features(entity.getFeatures())
                .maxCapacity(entity.getMaxCapacity())
                .duration(entity.getDuration())
                .durationType(entity.getDurationType())
                .isActive(entity.getIsActive())
                .isAvailable(entity.getIsAvailable())
                .availableDays(entity.getAvailableDays())
                .availableTimeSlot(entity.getAvailableTimeSlot())
                .totalBookings(entity.getTotalBookings())
                .averageRating(entity.getAverageRating())
                .totalReviews(entity.getTotalReviews())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}
