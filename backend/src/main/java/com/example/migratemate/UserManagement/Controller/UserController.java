package com.example.migratemate.UserManagement.Controller;

import com.example.migratemate.UserManagement.Dto.*;
import com.example.migratemate.UserManagement.Service.UserService;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Slf4j
public class UserController {

    private final UserService userService;
    private final ObjectMapper objectMapper;

    /**
     * Register a new user (JSON with Base64 images)
     */
    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@RequestBody RegisterRequest request) {
        try {
            AuthResponse response = userService.register(request);
            return ResponseEntity.ok(ApiResponse.<AuthResponse>builder()
                    .success(true)
                    .message("User registered successfully")
                    .data(response)
                    .build());
        } catch (IllegalArgumentException e) {
            log.error("Registration failed: {}", e.getMessage());
            return ResponseEntity.badRequest().body(ApiResponse.<AuthResponse>builder()
                    .success(false)
                    .message(e.getMessage())
                    .build());
        } catch (IOException e) {
            log.error("Image upload failed during registration", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.<AuthResponse>builder()
                            .success(false)
                            .message("Failed to upload images: " + e.getMessage())
                            .build());
        } catch (Exception e) {
            log.error("Unexpected error during registration", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.<AuthResponse>builder()
                            .success(false)
                            .message("Registration failed: " + e.getMessage())
                            .build());
        }
    }

    /**
     * Send OTP
     */
    @PostMapping("/send-otp")
    public ResponseEntity<ApiResponse<Void>> sendOtp(@RequestParam String email) {
        try {
            userService.sendRegistrationOtp(email);
            return ResponseEntity.ok(ApiResponse.<Void>builder()
                    .success(true)
                    .message("OTP sent successfully to " + email)
                    .build());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.<Void>builder()
                    .success(false)
                    .message(e.getMessage())
                    .build());
        } catch (Exception e) {
            log.error("Failed to send OTP", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.<Void>builder()
                            .success(false)
                            .message("Failed to send OTP")
                            .build());
        }
    }

    /**
     * Verify OTP
     */
    @PostMapping("/verify-otp")
    public ResponseEntity<ApiResponse<Boolean>> verifyOtp(@RequestParam String email, @RequestParam String otp) {
        boolean isValid = userService.verifyRegistrationOtp(email, otp);
        if (isValid) {
            return ResponseEntity.ok(ApiResponse.<Boolean>builder()
                    .success(true)
                    .message("OTP Verified")
                    .data(true)
                    .build());
        } else {
            return ResponseEntity.badRequest().body(ApiResponse.<Boolean>builder()
                    .success(false)
                    .message("Invalid or expired OTP")
                    .data(false)
                    .build());
        }
    }

    /**
     * Login user
     */
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@RequestBody LoginRequest request) {
        try {
            AuthResponse response = userService.login(request);
            return ResponseEntity.ok(ApiResponse.<AuthResponse>builder()
                    .success(true)
                    .message("Login successful")
                    .data(response)
                    .build());
        } catch (Exception e) {
            log.error("Login failed: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.<AuthResponse>builder()
                            .success(false)
                            .message("Invalid email or password")
                            .build());
        }
    }

    /**
     * Get current user profile
     */
    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<UserResponse>> getProfile() {
        try {
            String email = getCurrentUserEmail();
            UserResponse user = userService.getUserProfile(email);
            return ResponseEntity.ok(ApiResponse.<UserResponse>builder()
                    .success(true)
                    .message("Profile retrieved successfully")
                    .data(user)
                    .build());
        } catch (Exception e) {
            log.error("Failed to get profile: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.<UserResponse>builder()
                            .success(false)
                            .message("User not found")
                            .build());
        }
    }

    /**
     * Get user profile by ID
     */
    @GetMapping("/{userId}")
    public ResponseEntity<ApiResponse<UserResponse>> getUserById(@PathVariable String userId) {
        try {
            UserResponse user = userService.getUserProfileById(userId);
            return ResponseEntity.ok(ApiResponse.<UserResponse>builder()
                    .success(true)
                    .message("User retrieved successfully")
                    .data(user)
                    .build());
        } catch (Exception e) {
            log.error("Failed to get user: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.<UserResponse>builder()
                            .success(false)
                            .message("User not found")
                            .build());
        }
    }

    /**
     * Update user profile (JSON with Base64 images)
     */
    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<UserResponse>> updateProfile(
            @RequestBody UpdateProfileRequest request) {
        try {
            String email = getCurrentUserEmail();
            UserResponse user = userService.updateProfile(email, request);
            return ResponseEntity.ok(ApiResponse.<UserResponse>builder()
                    .success(true)
                    .message("Profile updated successfully")
                    .data(user)
                    .build());
        } catch (IOException e) {
            log.error("Image upload failed during profile update", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.<UserResponse>builder()
                            .success(false)
                            .message("Failed to upload images: " + e.getMessage())
                            .build());
        } catch (Exception e) {
            log.error("Failed to update profile: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.<UserResponse>builder()
                            .success(false)
                            .message("Failed to update profile: " + e.getMessage())
                            .build());
        }
    }

    /**
     * Update user profile with multipart form data
     */
    @PutMapping(value = "/profile/multipart", consumes = "multipart/form-data")
    public ResponseEntity<ApiResponse<UserResponse>> updateProfileMultipart(
            @RequestPart(value = "data", required = false) String dataJson,
            @RequestPart(value = "avatar", required = false) MultipartFile avatar,
            @RequestPart(value = "passport", required = false) MultipartFile passport,
            @RequestPart(value = "selfie", required = false) MultipartFile selfie) {
        try {
            String email = getCurrentUserEmail();

            // Parse JSON data
            UpdateProfileRequest request = new UpdateProfileRequest();
            if (dataJson != null && !dataJson.isEmpty()) {
                request = objectMapper.readValue(dataJson, UpdateProfileRequest.class);
            }

            UserResponse user = userService.updateProfileMultipart(email, request, avatar, passport, selfie);
            return ResponseEntity.ok(ApiResponse.<UserResponse>builder()
                    .success(true)
                    .message("Profile updated successfully")
                    .data(user)
                    .build());
        } catch (IOException e) {
            log.error("Image upload failed during profile update", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.<UserResponse>builder()
                            .success(false)
                            .message("Failed to upload images: " + e.getMessage())
                            .build());
        } catch (Exception e) {
            log.error("Failed to update profile: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.<UserResponse>builder()
                            .success(false)
                            .message("Failed to update profile: " + e.getMessage())
                            .build());
        }
    }

    /**
     * Change password
     */
    @PutMapping("/password")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            @RequestBody ChangePasswordRequest request) {
        try {
            String email = getCurrentUserEmail();
            userService.changePassword(email, request);
            return ResponseEntity.ok(ApiResponse.<Void>builder()
                    .success(true)
                    .message("Password changed successfully")
                    .build());
        } catch (IllegalArgumentException e) {
            log.error("Password change failed: {}", e.getMessage());
            return ResponseEntity.badRequest().body(ApiResponse.<Void>builder()
                    .success(false)
                    .message(e.getMessage())
                    .build());
        } catch (Exception e) {
            log.error("Failed to change password: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.<Void>builder()
                            .success(false)
                            .message("Failed to change password: " + e.getMessage())
                            .build());
        }
    }

    /**
     * Delete user account
     */
    @DeleteMapping("/account")
    public ResponseEntity<ApiResponse<Void>> deleteAccount() {
        try {
            String email = getCurrentUserEmail();
            userService.deleteAccount(email);
            return ResponseEntity.ok(ApiResponse.<Void>builder()
                    .success(true)
                    .message("Account deleted successfully")
                    .build());
        } catch (Exception e) {
            log.error("Failed to delete account: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.<Void>builder()
                            .success(false)
                            .message("Failed to delete account: " + e.getMessage())
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
    // --- Admin Endpoints ---

    /**
     * Get all users (Admin)
     */
    @GetMapping("/all")
    public ResponseEntity<ApiResponse<java.util.List<UserResponse>>> getAllUsers() {
        try {
            java.util.List<UserResponse> users = userService.getAllUsers();
            return ResponseEntity.ok(ApiResponse.<java.util.List<UserResponse>>builder()
                    .success(true)
                    .message("All users retrieved successfully")
                    .data(users)
                    .build());
        } catch (Exception e) {
            log.error("Failed to fetch all users", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.<java.util.List<UserResponse>>builder()
                            .success(false)
                            .message("Failed to fetch users")
                            .build());
        }
    }

    /**
     * Delete user by ID (Admin)
     */
    @DeleteMapping("/{userId}")
    public ResponseEntity<ApiResponse<Void>> deleteUserById(@PathVariable String userId) {
        try {
            userService.deleteUserById(userId);
            return ResponseEntity.ok(ApiResponse.<Void>builder()
                    .success(true)
                    .message("User deleted successfully")
                    .build());
        } catch (RuntimeException e) {
            log.error("Failed to delete user: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.<Void>builder()
                            .success(false)
                            .message(e.getMessage())
                            .build());
        } catch (Exception e) {
            log.error("Failed to delete user: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.<Void>builder()
                            .success(false)
                            .message("Failed to delete user: " + e.getMessage())
                            .build());
        }
    }

    /**
     * Toggle user verification (Admin)
     */
    @PatchMapping("/{userId}/verify")
    public ResponseEntity<ApiResponse<UserResponse>> toggleVerification(
            @PathVariable String userId,
            @RequestParam Boolean isVerified) {
        try {
            UserResponse user = userService.toggleUserVerification(userId, isVerified);
            return ResponseEntity.ok(ApiResponse.<UserResponse>builder()
                    .success(true)
                    .message("User verification updated")
                    .data(user)
                    .build());
        } catch (Exception e) {
            log.error("Failed to update verification", e);
            return ResponseEntity.badRequest().body(ApiResponse.<UserResponse>builder()
                    .success(false)
                    .message(e.getMessage())
                    .build());
        }
    }

    /**
     * Update any user (Admin)
     */
    @PutMapping("/{userId}/admin-update")
    public ResponseEntity<ApiResponse<UserResponse>> updateUserByAdmin(
            @PathVariable String userId,
            @RequestBody UpdateProfileRequest request) {
        try {
            UserResponse user = userService.updateUserByAdmin(userId, request);
            return ResponseEntity.ok(ApiResponse.<UserResponse>builder()
                    .success(true)
                    .message("User updated successfully")
                    .data(user)
                    .build());
        } catch (Exception e) {
            log.error("Failed to update user", e);
            return ResponseEntity.badRequest().body(ApiResponse.<UserResponse>builder()
                    .success(false)
                    .message(e.getMessage())
                    .build());
        }
    }
}