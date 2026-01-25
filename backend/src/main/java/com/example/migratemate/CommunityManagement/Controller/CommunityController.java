package com.example.migratemate.CommunityManagement.Controller;

import com.example.migratemate.CommunityManagement.Dto.*;
import com.example.migratemate.CommunityManagement.Service.CommunityService;
import com.example.migratemate.UserManagement.Dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/communities")
@RequiredArgsConstructor
@Slf4j
public class CommunityController {

    private final CommunityService communityService;

    /**
     * Create a new community
     */
    @PostMapping
    public ResponseEntity<ApiResponse<CommunityResponse>> createCommunity(
            @RequestBody CreateCommunityRequest request) {
        try {
            String email = getCurrentUserEmail();
            CommunityResponse community = communityService.createCommunity(request, email);
            return ResponseEntity.ok(ApiResponse.<CommunityResponse>builder()
                    .success(true)
                    .message("Community created successfully")
                    .data(community)
                    .build());
        } catch (IllegalArgumentException e) {
            log.error("Community creation failed: {}", e.getMessage());
            return ResponseEntity.badRequest().body(ApiResponse.<CommunityResponse>builder()
                    .success(false)
                    .message(e.getMessage())
                    .build());
        } catch (IOException e) {
            log.error("Image upload failed during community creation", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.<CommunityResponse>builder()
                            .success(false)
                            .message("Failed to upload image: " + e.getMessage())
                            .build());
        } catch (Exception e) {
            log.error("Unexpected error during community creation", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.<CommunityResponse>builder()
                            .success(false)
                            .message("Failed to create community: " + e.getMessage())
                            .build());
        }
    }

    /**
     * Get all active communities
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<CommunityResponse>>> getAllCommunities() {
        try {
            String email = getCurrentUserEmail();
            List<CommunityResponse> communities = communityService.getAllCommunities(email);
            return ResponseEntity.ok(ApiResponse.<List<CommunityResponse>>builder()
                    .success(true)
                    .message("Communities retrieved successfully")
                    .data(communities)
                    .build());
        } catch (Exception e) {
            log.error("Failed to get communities: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.<List<CommunityResponse>>builder()
                            .success(false)
                            .message("Failed to retrieve communities: " + e.getMessage())
                            .build());
        }
    }

    /**
     * Get communities for current user
     */
    @GetMapping("/my-communities")
    public ResponseEntity<ApiResponse<List<CommunityResponse>>> getMyCommunities() {
        try {
            String email = getCurrentUserEmail();
            List<CommunityResponse> communities = communityService.getUserCommunities(email);
            return ResponseEntity.ok(ApiResponse.<List<CommunityResponse>>builder()
                    .success(true)
                    .message("Your communities retrieved successfully")
                    .data(communities)
                    .build());
        } catch (Exception e) {
            log.error("Failed to get user communities: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.<List<CommunityResponse>>builder()
                            .success(false)
                            .message("Failed to retrieve your communities: " + e.getMessage())
                            .build());
        }
    }

    /**
     * Get community by ID
     */
    @GetMapping("/{communityId}")
    public ResponseEntity<ApiResponse<CommunityResponse>> getCommunityById(
            @PathVariable String communityId) {
        try {
            String email = getCurrentUserEmail();
            CommunityResponse community = communityService.getCommunityById(communityId, email);
            return ResponseEntity.ok(ApiResponse.<CommunityResponse>builder()
                    .success(true)
                    .message("Community retrieved successfully")
                    .data(community)
                    .build());
        } catch (IllegalArgumentException e) {
            log.error("Community not found: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.<CommunityResponse>builder()
                            .success(false)
                            .message(e.getMessage())
                            .build());
        } catch (Exception e) {
            log.error("Failed to get community: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.<CommunityResponse>builder()
                            .success(false)
                            .message("Failed to retrieve community: " + e.getMessage())
                            .build());
        }
    }

    /**
     * Get members of a community
     */
    @GetMapping("/{communityId}/members")
    public ResponseEntity<ApiResponse<CommunityMemberResponse>> getCommunityMembers(
            @PathVariable String communityId) {
        try {
            String email = getCurrentUserEmail();
            CommunityMemberResponse response = communityService.getCommunityMembers(communityId, email);
            return ResponseEntity.ok(ApiResponse.<CommunityMemberResponse>builder()
                    .success(true)
                    .message("Community members retrieved successfully")
                    .data(response)
                    .build());
        } catch (IllegalArgumentException e) {
            log.error("Failed to get members: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.<CommunityMemberResponse>builder()
                            .success(false)
                            .message(e.getMessage())
                            .build());
        } catch (Exception e) {
            log.error("Failed to get community members: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.<CommunityMemberResponse>builder()
                            .success(false)
                            .message("Failed to retrieve members: " + e.getMessage())
                            .build());
        }
    }

    /**
     * Join a community
     */
    @PostMapping("/{communityId}/join")
    public ResponseEntity<ApiResponse<Void>> joinCommunity(@PathVariable String communityId) {
        try {
            String email = getCurrentUserEmail();
            communityService.joinCommunity(communityId, email);
            return ResponseEntity.ok(ApiResponse.<Void>builder()
                    .success(true)
                    .message("Successfully joined community")
                    .build());
        } catch (IllegalArgumentException e) {
            log.error("Failed to join community: {}", e.getMessage());
            return ResponseEntity.badRequest().body(ApiResponse.<Void>builder()
                    .success(false)
                    .message(e.getMessage())
                    .build());
        } catch (Exception e) {
            log.error("Failed to join community: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.<Void>builder()
                            .success(false)
                            .message("Failed to join community: " + e.getMessage())
                            .build());
        }
    }

    /**
     * Leave a community
     */
    @PostMapping("/{communityId}/leave")
    public ResponseEntity<ApiResponse<Void>> leaveCommunity(@PathVariable String communityId) {
        try {
            String email = getCurrentUserEmail();
            communityService.leaveCommunity(communityId, email);
            return ResponseEntity.ok(ApiResponse.<Void>builder()
                    .success(true)
                    .message("Successfully left community")
                    .build());
        } catch (IllegalArgumentException e) {
            log.error("Failed to leave community: {}", e.getMessage());
            return ResponseEntity.badRequest().body(ApiResponse.<Void>builder()
                    .success(false)
                    .message(e.getMessage())
                    .build());
        } catch (Exception e) {
            log.error("Failed to leave community: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.<Void>builder()
                            .success(false)
                            .message("Failed to leave community: " + e.getMessage())
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