package com.example.migratemate.ServiceManagement.Service;

import com.example.migratemate.ServiceManagement.Dto.*;
import com.example.migratemate.ServiceManagement.Entity.ServiceEntity;
import com.example.migratemate.ServiceManagement.Entity.ServiceStatus;
import com.example.migratemate.ServiceManagement.Repository.ServiceRepository;
import com.example.migratemate.UserManagement.Entity.User;
import com.example.migratemate.UserManagement.Repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ServiceService {

    private final ServiceRepository serviceRepository;
    private final UserRepository userRepository;
    private final ImageUploadService imageUploadService;
    private final com.example.migratemate.MailManagement.Service.EmailService emailService;

    // Create a new service
    public ServiceResponse createService(String email, CreateServiceRequest request) throws IOException {
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

        // Upload base64 images to Cloudinary
        List<String> imageUrls = new ArrayList<>();
        if (request.getImagesBase64() != null && !request.getImagesBase64().isEmpty()) {
            imageUrls = imageUploadService.uploadServiceImages(request.getImagesBase64());
            log.info("Uploaded {} images to Cloudinary", imageUrls.size());
        }
        // Also add any direct URLs provided
        if (request.getImageUrls() != null && !request.getImageUrls().isEmpty()) {
            imageUrls.addAll(request.getImageUrls());
        }
        service.setImageUrls(imageUrls);

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

        // Status - default to INREVIEW
        service.setStatus(ServiceStatus.INREVIEW.name());

        // Timestamps
        service.setCreatedAt(LocalDateTime.now());
        service.setUpdatedAt(LocalDateTime.now());

        ServiceEntity savedService = serviceRepository.save(service);
        log.info("Service created successfully with id: {}", savedService.getId());

        return mapToResponse(savedService);
    }

    // Update an existing service
    public ServiceResponse updateService(String serviceId, String email, UpdateServiceRequest request)
            throws IOException {
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

        // Handle image updates
        List<String> currentImages = service.getImageUrls() != null ? new ArrayList<>(service.getImageUrls())
                : new ArrayList<>();

        // Remove specified images from Cloudinary and list
        if (request.getRemoveImageUrls() != null && !request.getRemoveImageUrls().isEmpty()) {
            for (String urlToRemove : request.getRemoveImageUrls()) {
                if (currentImages.remove(urlToRemove)) {
                    imageUploadService.deleteServiceImage(urlToRemove);
                    log.info("Deleted image from Cloudinary: {}", urlToRemove);
                }
            }
        }

        // Upload new base64 images to Cloudinary
        if (request.getNewImagesBase64() != null && !request.getNewImagesBase64().isEmpty()) {
            List<String> newUrls = imageUploadService.uploadServiceImages(request.getNewImagesBase64());
            currentImages.addAll(newUrls);
            log.info("Uploaded {} new images to Cloudinary", newUrls.size());
        }

        // Add new direct URLs if provided
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

    // Admin delete service with reason
    public void adminDeleteService(String serviceId, String reason) {
        ServiceEntity service = serviceRepository.findById(serviceId)
                .orElseThrow(() -> new RuntimeException("Service not found"));

        // Fetch provider to get email
        User provider = userRepository.findById(service.getProviderId())
                .orElseThrow(() -> new RuntimeException("Provider not found"));

        // Send email notification
        emailService.sendServiceDeletionEmail(provider.getEmail(), service.getTitle(), reason);

        // Delete service
        serviceRepository.delete(service);
        log.info("Service deleted by admin: {} Reason: {}", serviceId, reason);
    }

    // Update service status (admin only)
    public ServiceResponse updateServiceStatus(String serviceId, String status, String reason) {
        ServiceEntity service = serviceRepository.findById(serviceId)
                .orElseThrow(() -> new RuntimeException("Service not found"));

        // Validate status value
        try {
            ServiceStatus.valueOf(status);
        } catch (IllegalArgumentException e) {
            throw new RuntimeException(
                    "Invalid status: " + status + ". Valid values are: INREVIEW, APPROVED, ADVICED");
        }

        service.setStatus(status);
        service.setUpdatedAt(LocalDateTime.now());

        ServiceEntity updatedService = serviceRepository.save(service);
        log.info("Service status updated: {} -> {}", serviceId, status);

        // Send email notifications based on status
        try {
            User provider = userRepository.findById(service.getProviderId())
                    .orElse(null);
            if (provider != null) {
                if ("APPROVED".equals(status)) {
                    emailService.sendServiceApprovalEmail(provider.getEmail(), service.getTitle());
                } else if ("ADVICED".equals(status) && reason != null && !reason.isEmpty()) {
                    emailService.sendServiceAdviceEmail(provider.getEmail(), service.getTitle(), reason);
                }
            }
        } catch (Exception e) {
            log.error("Failed to send status email for service: {}", serviceId, e);
        }

        return mapToResponse(updatedService);
    }

    // Get service by ID
    public ServiceResponse getServiceById(String serviceId) {
        ServiceEntity service = serviceRepository.findById(serviceId)
                .orElseThrow(() -> new RuntimeException("Service not found"));
        return mapToResponse(service);
    }

    // Get all active and APPROVED services (public)
    public List<ServiceResponse> getAllServices() {
        return serviceRepository.findAllActive()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // Get all services for admin (all statuses)
    public List<ServiceResponse> getAllServicesAdmin() {
        return serviceRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // Get services by status (admin)
    public List<ServiceResponse> getServicesByStatus(String status) {
        return serviceRepository.findByStatus(status)
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
            // Start with all active services and filter in memory
            results = serviceRepository.findAllActive();
        }

        // Apply all filters in memory for flexibility
        return results.stream()
                .filter(s -> {
                    // Category filter
                    if (request.getCategory() != null && !request.getCategory().isEmpty()) {
                        if (!request.getCategory().equalsIgnoreCase(s.getCategory())) {
                            return false;
                        }
                    }
                    // Origin filter (case-insensitive contains)
                    if (request.getOrigin() != null && !request.getOrigin().isEmpty()) {
                        if (s.getOrigin() == null
                                || !s.getOrigin().toLowerCase().contains(request.getOrigin().toLowerCase())) {
                            return false;
                        }
                    }
                    // Destination filter (case-insensitive contains)
                    if (request.getDestination() != null && !request.getDestination().isEmpty()) {
                        if (s.getDestination() == null
                                || !s.getDestination().toLowerCase().contains(request.getDestination().toLowerCase())) {
                            return false;
                        }
                    }
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
                .status(entity.getStatus())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}
