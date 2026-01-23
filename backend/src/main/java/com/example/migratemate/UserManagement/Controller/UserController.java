package com.example.migratemate.UserManagement.Controller;

import com.example.migratemate.UserManagement.Dto.*;
import com.example.migratemate.UserManagement.Service.UserService;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
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
     * [INTEGRATION] Sync User from Asgardeo
     * This is called immediately after frontend login to ensure the user exists in MongoDB.
     */
    @PostMapping("/auth/sync")
    public ResponseEntity<ApiResponse<UserResponse>> syncUser(@AuthenticationPrincipal Jwt jwt) {
        try {
            // Extract claims from Asgardeo Token
            String email = jwt.getClaimAsString("email");
            String firstName = jwt.getClaimAsString("given_name");
            String lastName = jwt.getClaimAsString("family_name");

            // Handle potential nulls
            if (firstName == null) firstName = "User";
            if (lastName == null) lastName = "";

            UserResponse user = userService.syncUserFromToken(email, firstName, lastName);

            return ResponseEntity.ok(ApiResponse.<UserResponse>builder()
                    .success(true)
                    .message("User synced successfully")
                    .data(user)
                    .build());
        } catch (Exception e) {
            log.error("Sync failed: {}", e.getMessage());
            return ResponseEntity.badRequest().body(ApiResponse.<UserResponse>builder()
                    .success(false)
                    .message("Sync failed: " + e.getMessage())
                    .build());
        }
    }

    /**
     * Get current user profile (Secured via JWT)
     */
    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<UserResponse>> getProfile(@AuthenticationPrincipal Jwt jwt) {
        try {
            String email = jwt.getClaimAsString("email");
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
     * Get user profile by ID (Public/Shared)
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
     * Update user profile (JSON body)
     */
    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<UserResponse>> updateProfile(
            @AuthenticationPrincipal Jwt jwt,
            @RequestBody UpdateProfileRequest request) {
        try {
            String email = jwt.getClaimAsString("email");
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
     * Update user profile with multipart form data (Images + Data)
     */
    @PutMapping(value = "/profile/multipart", consumes = "multipart/form-data")
    public ResponseEntity<ApiResponse<UserResponse>> updateProfileMultipart(
            @AuthenticationPrincipal Jwt jwt,
            @RequestPart(value = "data", required = false) String dataJson,
            @RequestPart(value = "avatar", required = false) MultipartFile avatar,
            @RequestPart(value = "passport", required = false) MultipartFile passport,
            @RequestPart(value = "selfie", required = false) MultipartFile selfie) {
        try {
            String email = jwt.getClaimAsString("email");

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
     * Delete user account
     */
    @DeleteMapping("/account")
    public ResponseEntity<ApiResponse<Void>> deleteAccount(@AuthenticationPrincipal Jwt jwt) {
        try {
            String email = jwt.getClaimAsString("email");
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

    // --- Admin Endpoints (Unchanged, assuming Admin Role is checked via SecurityConfig) ---

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