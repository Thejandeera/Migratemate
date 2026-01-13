package com.example.migratemate.UserManagement.Service;

import com.example.migratemate.Config.JwtService;
import com.example.migratemate.UserManagement.Dto.*;
import com.example.migratemate.UserManagement.Entity.User;
import com.example.migratemate.UserManagement.Repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Collections;

@Service
@Slf4j
public class UserService implements UserDetailsService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final CloudinaryService cloudinaryService;

    public UserService(UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            @Lazy AuthenticationManager authenticationManager,
            CloudinaryService cloudinaryService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
        this.cloudinaryService = cloudinaryService;
    }

    /**
     * Register a new user
     */
    @Transactional
    public AuthResponse register(RegisterRequest request) throws IOException {
        // Check if user already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already registered");
        }

        // Upload images to Cloudinary
        String avatarUrl = null;
        String passportUrl = null;
        String selfieUrl = null;

        try {
            if (request.getAvatarBase64() != null && !request.getAvatarBase64().isEmpty()) {
                avatarUrl = cloudinaryService.uploadAvatar(request.getAvatarBase64());
            }
            if (request.getPassportImageBase64() != null && !request.getPassportImageBase64().isEmpty()) {
                passportUrl = cloudinaryService.uploadPassport(request.getPassportImageBase64());
            }
            if (request.getSelfieImageBase64() != null && !request.getSelfieImageBase64().isEmpty()) {
                selfieUrl = cloudinaryService.uploadSelfie(request.getSelfieImageBase64());
            }
        } catch (IOException e) {
            log.error("Failed to upload images during registration", e);
            throw new IOException("Failed to upload images: " + e.getMessage());
        }

        // Create user
        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .phone(request.getPhone())
                .countryOfOrigin(request.getCountryOfOrigin())
                .destinationCountry(request.getDestinationCountry())
                .avatarUrl(avatarUrl)
                .passportImageUrl(passportUrl)
                .selfieImageUrl(selfieUrl)
                .isVerified(false)
                .isHelper(false)
                .rating(0.0)
                .totalReviews(0)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        user.generateFullName();
        user = userRepository.save(user);

        log.info("User registered successfully: {}", user.getEmail());

        // Generate tokens
        UserDetails userDetails = loadUserByUsername(user.getEmail());
        String token = jwtService.generateToken(userDetails);
        String refreshToken = jwtService.generateRefreshToken(userDetails);

        return AuthResponse.builder()
                .token(token)
                .refreshToken(refreshToken)
                .user(mapToUserResponse(user))
                .build();
    }

    /**
     * Login user
     */
    public AuthResponse login(LoginRequest request) {
        // Authenticate user
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()));

        // Find user
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        // Generate tokens
        UserDetails userDetails = loadUserByUsername(user.getEmail());
        String token = jwtService.generateToken(userDetails);
        String refreshToken = jwtService.generateRefreshToken(userDetails);

        log.info("User logged in successfully: {}", user.getEmail());

        return AuthResponse.builder()
                .token(token)
                .refreshToken(refreshToken)
                .user(mapToUserResponse(user))
                .build();
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

    /**
     * Update user profile
     */
    @Transactional
    public UserResponse updateProfile(String email, UpdateProfileRequest request) throws IOException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        // Update basic fields
        if (request.getFirstName() != null) {
            user.setFirstName(request.getFirstName());
        }
        if (request.getLastName() != null) {
            user.setLastName(request.getLastName());
        }
        if (request.getBio() != null) {
            user.setBio(request.getBio());
        }
        if (request.getLocation() != null) {
            user.setLocation(request.getLocation());
        }
        if (request.getPhone() != null) {
            user.setPhone(request.getPhone());
        }
        if (request.getSkills() != null) {
            user.setSkills(request.getSkills());
        }
        if (request.getLanguages() != null) {
            user.setLanguages(request.getLanguages());
        }
        if (request.getCountryOfOrigin() != null) {
            user.setCountryOfOrigin(request.getCountryOfOrigin());
        }
        if (request.getDestinationCountry() != null) {
            user.setDestinationCountry(request.getDestinationCountry());
        }

        // Upload and update images if provided
        try {
            if (request.getAvatarBase64() != null && !request.getAvatarBase64().isEmpty()) {
                // Delete old avatar if exists
                if (user.getAvatarUrl() != null) {
                    cloudinaryService.deleteImage(user.getAvatarUrl());
                }
                String avatarUrl = cloudinaryService.uploadAvatar(request.getAvatarBase64());
                user.setAvatarUrl(avatarUrl);
            }

            if (request.getPassportImageBase64() != null && !request.getPassportImageBase64().isEmpty()) {
                // Delete old passport if exists
                if (user.getPassportImageUrl() != null) {
                    cloudinaryService.deleteImage(user.getPassportImageUrl());
                }
                String passportUrl = cloudinaryService.uploadPassport(request.getPassportImageBase64());
                user.setPassportImageUrl(passportUrl);
            }

            if (request.getSelfieImageBase64() != null && !request.getSelfieImageBase64().isEmpty()) {
                // Delete old selfie if exists
                if (user.getSelfieImageUrl() != null) {
                    cloudinaryService.deleteImage(user.getSelfieImageUrl());
                }
                String selfieUrl = cloudinaryService.uploadSelfie(request.getSelfieImageBase64());
                user.setSelfieImageUrl(selfieUrl);
            }
        } catch (IOException e) {
            log.error("Failed to upload images during profile update", e);
            throw new IOException("Failed to upload images: " + e.getMessage());
        }

        // Update full name and timestamp
        user.generateFullName();
        user.updateTimestamp();

        user = userRepository.save(user);
        log.info("User profile updated successfully: {}", user.getEmail());

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
        if (request.getFirstName() != null) {
            user.setFirstName(request.getFirstName());
        }
        if (request.getLastName() != null) {
            user.setLastName(request.getLastName());
        }
        if (request.getBio() != null) {
            user.setBio(request.getBio());
        }
        if (request.getLocation() != null) {
            user.setLocation(request.getLocation());
        }
        if (request.getPhone() != null) {
            user.setPhone(request.getPhone());
        }
        if (request.getSkills() != null) {
            user.setSkills(request.getSkills());
        }
        if (request.getLanguages() != null) {
            user.setLanguages(request.getLanguages());
        }
        if (request.getCountryOfOrigin() != null) {
            user.setCountryOfOrigin(request.getCountryOfOrigin());
        }
        if (request.getDestinationCountry() != null) {
            user.setDestinationCountry(request.getDestinationCountry());
        }

        // Upload and update images from multipart files
        try {
            if (avatar != null && !avatar.isEmpty()) {
                if (user.getAvatarUrl() != null) {
                    cloudinaryService.deleteImage(user.getAvatarUrl());
                }
                String avatarUrl = cloudinaryService.uploadAvatarMultipart(avatar);
                user.setAvatarUrl(avatarUrl);
            }

            if (passport != null && !passport.isEmpty()) {
                if (user.getPassportImageUrl() != null) {
                    cloudinaryService.deleteImage(user.getPassportImageUrl());
                }
                String passportUrl = cloudinaryService.uploadPassportMultipart(passport);
                user.setPassportImageUrl(passportUrl);
            }

            if (selfie != null && !selfie.isEmpty()) {
                if (user.getSelfieImageUrl() != null) {
                    cloudinaryService.deleteImage(user.getSelfieImageUrl());
                }
                String selfieUrl = cloudinaryService.uploadSelfieMultipart(selfie);
                user.setSelfieImageUrl(selfieUrl);
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
     * Change user password
     */
    @Transactional
    public void changePassword(String email, ChangePasswordRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        // Verify current password
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Current password is incorrect");
        }

        // Update password
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.updateTimestamp();

        userRepository.save(user);
        log.info("Password changed successfully for user: {}", user.getEmail());
    }

    /**
     * Delete user account
     */
    @Transactional
    public void deleteAccount(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        // Delete images from Cloudinary
        if (user.getAvatarUrl() != null) {
            cloudinaryService.deleteImage(user.getAvatarUrl());
        }
        if (user.getPassportImageUrl() != null) {
            cloudinaryService.deleteImage(user.getPassportImageUrl());
        }
        if (user.getSelfieImageUrl() != null) {
            cloudinaryService.deleteImage(user.getSelfieImageUrl());
        }

        userRepository.delete(user);
        log.info("User account deleted: {}", email);
    }

    /**
     * Load user by username (email) for Spring Security
     */
    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));

        return org.springframework.security.core.userdetails.User.builder()
                .username(user.getEmail())
                .password(user.getPassword())
                .authorities(Collections.emptyList())
                .build();
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
