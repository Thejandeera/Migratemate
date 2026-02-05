package com.example.migratemate.ServiceManagement.Controller;

import com.example.migratemate.ServiceManagement.Dto.*;
import com.example.migratemate.ServiceManagement.Service.ServiceService;
import com.example.migratemate.UserManagement.Dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/services")
@RequiredArgsConstructor
@Slf4j
public class ServiceController {

    private final ServiceService serviceService;

    // Create a new service (requires authentication bearer tolken)
    @PostMapping
    public ResponseEntity<ApiResponse<ServiceResponse>> createService(@RequestBody CreateServiceRequest request) {
        try {
            String email = getCurrentUserEmail();
            ServiceResponse response = serviceService.createService(email, request);
            return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.<ServiceResponse>builder()
                    .success(true)
                    .message("Service created successfully")
                    .data(response)
                    .build());
        } catch (Exception e) {
            log.error("Failed to create service: {}", e.getMessage());
            return ResponseEntity.badRequest().body(ApiResponse.<ServiceResponse>builder()
                    .success(false)
                    .message("Failed to create service: " + e.getMessage())
                    .build());
        }
    }

    // Get all active services (public)
    @GetMapping
    public ResponseEntity<ApiResponse<List<ServiceResponse>>> getAllServices() {
        try {
            List<ServiceResponse> services = serviceService.getAllServices();
            return ResponseEntity.ok(ApiResponse.<List<ServiceResponse>>builder()
                    .success(true)
                    .message("Services retrieved successfully")
                    .data(services)
                    .build());
        } catch (Exception e) {
            log.error("Failed to get services: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.<List<ServiceResponse>>builder()
                            .success(false)
                            .message("Failed to retrieve services")
                            .build());
        }
    }

    // Get service by ID (public)
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ServiceResponse>> getServiceById(@PathVariable String id) {
        try {
            ServiceResponse service = serviceService.getServiceById(id);
            return ResponseEntity.ok(ApiResponse.<ServiceResponse>builder()
                    .success(true)
                    .message("Service retrieved successfully")
                    .data(service)
                    .build());
        } catch (RuntimeException e) {
            log.error("Service not found: {}", id);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.<ServiceResponse>builder()
                            .success(false)
                            .message("Service not found")
                            .build());
        }
    }

    // Get services by provider ID (public)
    @GetMapping("/provider/{providerId}")
    public ResponseEntity<ApiResponse<List<ServiceResponse>>> getServicesByProvider(@PathVariable String providerId) {
        try {
            List<ServiceResponse> services = serviceService.getServicesByProvider(providerId);
            return ResponseEntity.ok(ApiResponse.<List<ServiceResponse>>builder()
                    .success(true)
                    .message("Provider services retrieved successfully")
                    .data(services)
                    .build());
        } catch (Exception e) {
            log.error("Failed to get provider services: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.<List<ServiceResponse>>builder()
                            .success(false)
                            .message("Failed to retrieve provider services")
                            .build());
        }
    }

    // Get my services (requires authentication)
    @GetMapping("/my-services")
    public ResponseEntity<ApiResponse<List<ServiceResponse>>> getMyServices() {
        try {
            String email = getCurrentUserEmail();
            List<ServiceResponse> services = serviceService.getMyServices(email);
            return ResponseEntity.ok(ApiResponse.<List<ServiceResponse>>builder()
                    .success(true)
                    .message("Your services retrieved successfully")
                    .data(services)
                    .build());
        } catch (Exception e) {
            log.error("Failed to get my services: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.<List<ServiceResponse>>builder()
                            .success(false)
                            .message("Failed to retrieve your services")
                            .build());
        }
    }

    // Get services by category (public)
    @GetMapping("/category/{category}")
    public ResponseEntity<ApiResponse<List<ServiceResponse>>> getServicesByCategory(@PathVariable String category) {
        try {
            List<ServiceResponse> services = serviceService.getServicesByCategory(category);
            return ResponseEntity.ok(ApiResponse.<List<ServiceResponse>>builder()
                    .success(true)
                    .message("Category services retrieved successfully")
                    .data(services)
                    .build());
        } catch (Exception e) {
            log.error("Failed to get category services: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.<List<ServiceResponse>>builder()
                            .success(false)
                            .message("Failed to retrieve category services")
                            .build());
        }
    }

    // Search and filter services (public)
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<ServiceResponse>>> searchServices(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String origin,
            @RequestParam(required = false) String destination,
            @RequestParam(required = false) Double minPrice,
            @RequestParam(required = false) Double maxPrice,
            @RequestParam(required = false) String searchTerm,
            @RequestParam(required = false) String pricingType,
            @RequestParam(required = false) Boolean availableOnly) {
        try {
            ServiceSearchRequest request = ServiceSearchRequest.builder()
                    .category(category)
                    .origin(origin)
                    .destination(destination)
                    .minPrice(minPrice)
                    .maxPrice(maxPrice)
                    .searchTerm(searchTerm)
                    .pricingType(pricingType)
                    .availableOnly(availableOnly)
                    .build();

            List<ServiceResponse> services = serviceService.searchServices(request);
            return ResponseEntity.ok(ApiResponse.<List<ServiceResponse>>builder()
                    .success(true)
                    .message("Search completed successfully")
                    .data(services)
                    .build());
        } catch (Exception e) {
            log.error("Search failed: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.<List<ServiceResponse>>builder()
                            .success(false)
                            .message("Search failed: " + e.getMessage())
                            .build());
        }
    }

    // Update a service (requires authentication, owner only)
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ServiceResponse>> updateService(
            @PathVariable String id,
            @RequestBody UpdateServiceRequest request) {
        try {
            String email = getCurrentUserEmail();
            ServiceResponse response = serviceService.updateService(id, email, request);
            return ResponseEntity.ok(ApiResponse.<ServiceResponse>builder()
                    .success(true)
                    .message("Service updated successfully")
                    .data(response)
                    .build());
        } catch (RuntimeException e) {
            log.error("Failed to update service: {}", e.getMessage());
            HttpStatus status = e.getMessage().contains("not authorized") ? HttpStatus.FORBIDDEN : HttpStatus.NOT_FOUND;
            return ResponseEntity.status(status)
                    .body(ApiResponse.<ServiceResponse>builder()
                            .success(false)
                            .message(e.getMessage())
                            .build());
        } catch (Exception e) {
            log.error("Failed to update service: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.<ServiceResponse>builder()
                            .success(false)
                            .message("Failed to update service: " + e.getMessage())
                            .build());
        }
    }

    // Delete a service (requires authentication, owner only)
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteService(@PathVariable String id) {
        try {
            String email = getCurrentUserEmail();
            serviceService.deleteService(id, email);
            return ResponseEntity.ok(ApiResponse.<Void>builder()
                    .success(true)
                    .message("Service deleted successfully")
                    .build());
        } catch (RuntimeException e) {
            log.error("Failed to delete service: {}", e.getMessage());
            HttpStatus status = e.getMessage().contains("not authorized") ? HttpStatus.FORBIDDEN : HttpStatus.NOT_FOUND;
            return ResponseEntity.status(status)
                    .body(ApiResponse.<Void>builder()
                            .success(false)
                            .message(e.getMessage())
                            .build());
        }
    }

    // Toggle service availability (requires authentication, owner only)
    @PatchMapping("/{id}/toggle")
    public ResponseEntity<ApiResponse<ServiceResponse>> toggleAvailability(@PathVariable String id) {
        try {
            String email = getCurrentUserEmail();
            ServiceResponse response = serviceService.toggleServiceAvailability(id, email);
            return ResponseEntity.ok(ApiResponse.<ServiceResponse>builder()
                    .success(true)
                    .message("Service availability toggled successfully")
                    .data(response)
                    .build());
        } catch (RuntimeException e) {
            log.error("Failed to toggle service availability: {}", e.getMessage());
            HttpStatus status = e.getMessage().contains("not authorized") ? HttpStatus.FORBIDDEN : HttpStatus.NOT_FOUND;
            return ResponseEntity.status(status)
                    .body(ApiResponse.<ServiceResponse>builder()
                            .success(false)
                            .message(e.getMessage())
                            .build());
        }
    }

    // Get current authenticated user's email
    private String getCurrentUserEmail() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new IllegalStateException("User not authenticated");
        }
        return authentication.getName();
    }
}
