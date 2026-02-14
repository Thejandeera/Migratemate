package com.example.migratemate.SosManagement.Controller;

import com.example.migratemate.SosManagement.Dto.SosRequest;
import com.example.migratemate.SosManagement.Dto.SosResponse;
import com.example.migratemate.SosManagement.Service.SosService;
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
@RequestMapping("/api/sos")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class SosController {

    private final SosService sosService;

    /**
     * Create SOS Alert
     */
    @PostMapping("/alert")
    public ResponseEntity<ApiResponse<SosResponse>> createSosAlert(@RequestBody SosRequest request) {
        try {
            String email = getCurrentUserEmail();
            SosResponse response = sosService.createSosAlert(email, request);

            return ResponseEntity.ok(ApiResponse.<SosResponse>builder()
                    .success(true)
                    .message("SOS Alert created successfully")
                    .data(response)
                    .build());
        } catch (RuntimeException e) {
            log.error("Failed to create SOS alert: {}", e.getMessage());
            return ResponseEntity.badRequest().body(ApiResponse.<SosResponse>builder()
                    .success(false)
                    .message(e.getMessage())
                    .build());
        } catch (Exception e) {
            log.error("Unexpected error creating SOS alert", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.<SosResponse>builder()
                            .success(false)
                            .message("Failed to create SOS alert")
                            .build());
        }
    }

    /**
     * Get all active SOS alerts
     */
    @GetMapping("/active")
    public ResponseEntity<ApiResponse<List<SosResponse>>> getActiveSosAlerts() {
        try {
            List<SosResponse> alerts = sosService.getActiveSosAlerts();
            return ResponseEntity.ok(ApiResponse.<List<SosResponse>>builder()
                    .success(true)
                    .message("Active SOS alerts retrieved")
                    .data(alerts)
                    .build());
        } catch (Exception e) {
            log.error("Failed to get active SOS alerts", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.<List<SosResponse>>builder()
                            .success(false)
                            .message("Failed to retrieve alerts")
                            .build());
        }
    }

    /**
     * Get user's SOS alerts
     */
    @GetMapping("/my-alerts")
    public ResponseEntity<ApiResponse<List<SosResponse>>> getUserSosAlerts() {
        try {
            String email = getCurrentUserEmail();
            List<SosResponse> alerts = sosService.getUserSosAlerts(email);
            return ResponseEntity.ok(ApiResponse.<List<SosResponse>>builder()
                    .success(true)
                    .message("Your SOS alerts retrieved")
                    .data(alerts)
                    .build());
        } catch (Exception e) {
            log.error("Failed to get user SOS alerts", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.<List<SosResponse>>builder()
                            .success(false)
                            .message("Failed to retrieve alerts")
                            .build());
        }
    }

    /**
     * Get SOS alert by ID
     */
    @GetMapping("/{sosId}")
    public ResponseEntity<ApiResponse<SosResponse>> getSosAlertById(@PathVariable String sosId) {
        try {
            SosResponse alert = sosService.getSosAlertById(sosId);
            return ResponseEntity.ok(ApiResponse.<SosResponse>builder()
                    .success(true)
                    .message("SOS alert retrieved")
                    .data(alert)
                    .build());
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.<SosResponse>builder()
                            .success(false)
                            .message(e.getMessage())
                            .build());
        }
    }

    /**
     * Respond to SOS alert
     */
    @PostMapping("/{sosId}/respond")
    public ResponseEntity<ApiResponse<SosResponse>> respondToSos(@PathVariable String sosId) {
        try {
            String email = getCurrentUserEmail();
            SosResponse response = sosService.respondToSos(sosId, email);

            return ResponseEntity.ok(ApiResponse.<SosResponse>builder()
                    .success(true)
                    .message("You are now responding to this SOS alert")
                    .data(response)
                    .build());
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.<SosResponse>builder()
                    .success(false)
                    .message(e.getMessage())
                    .build());
        }
    }

    /**
     * Resolve SOS alert
     */
    @PutMapping("/{sosId}/resolve")
    public ResponseEntity<ApiResponse<SosResponse>> resolveSosAlert(@PathVariable String sosId) {
        try {
            String email = getCurrentUserEmail();
            SosResponse response = sosService.resolveSosAlert(sosId, email);

            return ResponseEntity.ok(ApiResponse.<SosResponse>builder()
                    .success(true)
                    .message("SOS alert resolved")
                    .data(response)
                    .build());
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.<SosResponse>builder()
                    .success(false)
                    .message(e.getMessage())
                    .build());
        }
    }

    /**
     * Cancel SOS alert
     */
    @DeleteMapping("/{sosId}")
    public ResponseEntity<ApiResponse<Void>> cancelSosAlert(@PathVariable String sosId) {
        try {
            String email = getCurrentUserEmail();
            sosService.cancelSosAlert(sosId, email);

            return ResponseEntity.ok(ApiResponse.<Void>builder()
                    .success(true)
                    .message("SOS alert cancelled")
                    .build());
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.<Void>builder()
                    .success(false)
                    .message(e.getMessage())
                    .build());
        }
    }

    /**
     * Get current authenticated user's email
     */
    private String getCurrentUserEmail() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new IllegalStateException("User not authenticated");
        }
        return authentication.getName();
    }
}