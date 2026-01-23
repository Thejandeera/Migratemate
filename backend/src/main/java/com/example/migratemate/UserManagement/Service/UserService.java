package com.example.migratemate.UserManagement.Service;

import com.example.migratemate.UserManagement.Dto.*;
import com.example.migratemate.UserManagement.Entity.User;
import com.example.migratemate.UserManagement.Repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {

    private final UserRepository userRepository;
    private final CloudinaryService cloudinaryService;

    // NOTE: Removed PasswordEncoder, JwtService, AuthenticationManager as Asgardeo handles auth now.

    /**
     * [INTEGRATION] Sync Logic: Find existing user or create a new one based on Asgardeo Email.
     */
    @Transactional
    public UserResponse syncUserFromToken(String email, String firstName, String lastName) {
        Optional<User> existingUser = userRepository.findByEmail(email);

        if (existingUser.isPresent()) {
            return mapToUserResponse(existingUser.get());
        } else {
            // User is new -> Create Skeleton Profile
            User newUser = User.builder()
                    .email(email)
                    .firstName(firstName)
                    .lastName(lastName)
                    .fullName(firstName + (lastName.isEmpty() ? "" : " " + lastName))
                    .isVerified(false) // Needs document upload later via /profile/multipart
                    .isHelper(false)
                    .rating(0.0)
                    .totalReviews(0)
                    .createdAt(LocalDateTime.now())
                    .updatedAt(LocalDateTime.now())
                    .build();

            newUser = userRepository.save(newUser);
            log.info("New user auto-provisioned from Asgardeo: {}", email);
            return mapToUserResponse(newUser);
        }
    }

    /**
     * Get user profile by email
     */
    public UserResponse getUserProfile(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        return mapToUserResponse(user);
    }

    /**
     * Get user profile by ID
     */
    public UserResponse getUserProfileById(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        return mapToUserResponse(user);
    }

    // --- Admin Features ---

    public java.util.List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::mapToUserResponse)
                .collect(java.util.stream.Collectors.toList());
    }

    @Transactional
    public UserResponse toggleUserVerification(String userId, Boolean isVerified) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        user.setIsVerified(isVerified);
        user.updateTimestamp();
        userRepository.save(user);
        return mapToUserResponse(user);
    }

    @Transactional
    public UserResponse updateUserByAdmin(String userId, UpdateProfileRequest request) throws IOException {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        if (request.getFirstName() != null) user.setFirstName(request.getFirstName());
        if (request.getLastName() != null) user.setLastName(request.getLastName());
        if (request.getBio() != null) user.setBio(request.getBio());
        if (request.getLocation() != null) user.setLocation(request.getLocation());
        if (request.getPhone() != null) user.setPhone(request.getPhone());
        if (request.getCountryOfOrigin() != null) user.setCountryOfOrigin(request.getCountryOfOrigin());
        if (request.getDestinationCountry() != null) user.setDestinationCountry(request.getDestinationCountry());

        user.generateFullName();
        user.updateTimestamp();

        userRepository.save(user);
        return mapToUserResponse(user);
    }

    /**
     * Update user profile
     */
    @Transactional
    public UserResponse updateProfile(String email, UpdateProfileRequest request) throws IOException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        // Update basic fields
        if (request.getFirstName() != null) user.setFirstName(request.getFirstName());
        if (request.getLastName() != null) user.setLastName(request.getLastName());
        if (request.getBio() != null) user.setBio(request.getBio());
        if (request.getLocation() != null) user.setLocation(request.getLocation());
        if (request.getPhone() != null) user.setPhone(request.getPhone());
        if (request.getSkills() != null) user.setSkills(request.getSkills());
        if (request.getLanguages() != null) user.setLanguages(request.getLanguages());
        if (request.getCountryOfOrigin() != null) user.setCountryOfOrigin(request.getCountryOfOrigin());
        if (request.getDestinationCountry() != null) user.setDestinationCountry(request.getDestinationCountry());

        // Handle Image Uploads via Base64 (Legacy support if needed, otherwise rely on multipart)
        try {
            if (request.getAvatarBase64() != null && !request.getAvatarBase64().isEmpty()) {
                if (user.getAvatarUrl() != null) cloudinaryService.deleteImage(user.getAvatarUrl());
                user.setAvatarUrl(cloudinaryService.uploadAvatar(request.getAvatarBase64()));
            }
            if (request.getPassportImageBase64() != null && !request.getPassportImageBase64().isEmpty()) {
                if (user.getPassportImageUrl() != null) cloudinaryService.deleteImage(user.getPassportImageUrl());
                user.setPassportImageUrl(cloudinaryService.uploadPassport(request.getPassportImageBase64()));
            }
            if (request.getSelfieImageBase64() != null && !request.getSelfieImageBase64().isEmpty()) {
                if (user.getSelfieImageUrl() != null) cloudinaryService.deleteImage(user.getSelfieImageUrl());
                user.setSelfieImageUrl(cloudinaryService.uploadSelfie(request.getSelfieImageBase64()));
            }
        } catch (IOException e) {
            log.error("Failed to upload images during profile update", e);
            throw new IOException("Failed to upload images: " + e.getMessage());
        }

        user.generateFullName();
        user.updateTimestamp();

        user = userRepository.save(user);
        return mapToUserResponse(user);
    }

    /**
     * Update profile with multipart files
     */
    @Transactional
    public UserResponse updateProfileMultipart(String email, UpdateProfileRequest request,
                                               MultipartFile avatar, MultipartFile passport,
                                               MultipartFile selfie) throws IOException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        // Update basic fields
        if (request.getFirstName() != null) user.setFirstName(request.getFirstName());
        if (request.getLastName() != null) user.setLastName(request.getLastName());
        if (request.getBio() != null) user.setBio(request.getBio());
        if (request.getLocation() != null) user.setLocation(request.getLocation());
        if (request.getPhone() != null) user.setPhone(request.getPhone());
        if (request.getSkills() != null) user.setSkills(request.getSkills());
        if (request.getLanguages() != null) user.setLanguages(request.getLanguages());
        if (request.getCountryOfOrigin() != null) user.setCountryOfOrigin(request.getCountryOfOrigin());
        if (request.getDestinationCountry() != null) user.setDestinationCountry(request.getDestinationCountry());

        // Upload and update images from multipart files
        try {
            if (avatar != null && !avatar.isEmpty()) {
                if (user.getAvatarUrl() != null) cloudinaryService.deleteImage(user.getAvatarUrl());
                user.setAvatarUrl(cloudinaryService.uploadAvatarMultipart(avatar));
            }

            if (passport != null && !passport.isEmpty()) {
                if (user.getPassportImageUrl() != null) cloudinaryService.deleteImage(user.getPassportImageUrl());
                user.setPassportImageUrl(cloudinaryService.uploadPassportMultipart(passport));
            }

            if (selfie != null && !selfie.isEmpty()) {
                if (user.getSelfieImageUrl() != null) cloudinaryService.deleteImage(user.getSelfieImageUrl());
                user.setSelfieImageUrl(cloudinaryService.uploadSelfieMultipart(selfie));
            }
        } catch (IOException e) {
            log.error("Failed to upload images during profile update", e);
            throw new IOException("Failed to upload images: " + e.getMessage());
        }

        user.generateFullName();
        user.updateTimestamp();

        user = userRepository.save(user);
        log.info("User profile updated successfully with multipart: {}", user.getEmail());

        return mapToUserResponse(user);
    }

    /**
     * Delete user account
     */
    @Transactional
    public void deleteAccount(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        // Delete images from Cloudinary
        if (user.getAvatarUrl() != null) cloudinaryService.deleteImage(user.getAvatarUrl());
        if (user.getPassportImageUrl() != null) cloudinaryService.deleteImage(user.getPassportImageUrl());
        if (user.getSelfieImageUrl() != null) cloudinaryService.deleteImage(user.getSelfieImageUrl());

        userRepository.delete(user);
        log.info("User account deleted: {}", email);
    }

    @Transactional
    public void deleteUserById(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));

        // Optional: Add logic to delete Cloudinary images here too if needed
        userRepository.delete(user);
        log.info("User deleted by ID: {}", userId);
    }

    /**
     * Map User entity to UserResponse DTO
     */
    private UserResponse mapToUserResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .fullName(user.getFullName())
                .avatarUrl(user.getAvatarUrl())
                .bio(user.getBio())
                .location(user.getLocation())
                .phone(user.getPhone())
                .skills(user.getSkills())
                .languages(user.getLanguages())
                .countryOfOrigin(user.getCountryOfOrigin())
                .destinationCountry(user.getDestinationCountry())
                .passportImageUrl(user.getPassportImageUrl())
                .selfieImageUrl(user.getSelfieImageUrl())
                .isVerified(user.getIsVerified())
                .isHelper(user.getIsHelper())
                .rating(user.getRating())
                .totalReviews(user.getTotalReviews())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }
}