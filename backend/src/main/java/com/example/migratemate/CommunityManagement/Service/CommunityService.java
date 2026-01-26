package com.example.migratemate.CommunityManagement.Service;

import com.example.migratemate.CommunityManagement.Dto.*;
import com.example.migratemate.CommunityManagement.Entity.Community;
import com.example.migratemate.CommunityManagement.Entity.CommunityMembership;
import com.example.migratemate.CommunityManagement.Repository.CommunityMembershipRepository;
import com.example.migratemate.CommunityManagement.Repository.CommunityRepository;
import com.example.migratemate.UserManagement.Entity.User;
import com.example.migratemate.UserManagement.Repository.UserRepository;
import com.example.migratemate.UserManagement.Service.CloudinaryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class CommunityService {

        private final CommunityRepository communityRepository;
        private final CommunityMembershipRepository membershipRepository;
        private final UserRepository userRepository;
        private final CloudinaryService cloudinaryService;

        /**
         * Create a new community
         */
        @Transactional
        public CommunityResponse createCommunity(CreateCommunityRequest request, String creatorEmail)
                        throws IOException {
                // Check if community already exists
                communityRepository.findByOriginCountryAndDestinationCountry(
                                request.getOriginCountry(),
                                request.getDestinationCountry()).ifPresent(c -> {
                                        throw new IllegalArgumentException("Community already exists for this route");
                                });

                // Upload cover image if provided
                String coverImageUrl = null;
                if (request.getCoverImageBase64() != null && !request.getCoverImageBase64().isEmpty()) {
                        try {
                                coverImageUrl = cloudinaryService.uploadImageFromBase64(
                                                request.getCoverImageBase64(),
                                                "migratemate/communities");
                        } catch (IOException e) {
                                log.error("Failed to upload community cover image", e);
                                throw new IOException("Failed to upload cover image: " + e.getMessage());
                        }
                }

                // Create community
                Community community = Community.builder()
                                .name(request.getName())
                                .originCountry(request.getOriginCountry())
                                .destinationCountry(request.getDestinationCountry())
                                .description(request.getDescription())
                                .rules(request.getRules())
                                .coverImageUrl(coverImageUrl)
                                .memberCount(0)
                                .isActive(true)
                                .createdAt(LocalDateTime.now())
                                .updatedAt(LocalDateTime.now())
                                .build();

                community = communityRepository.save(community);
                log.info("Community created: {} -> {}", request.getOriginCountry(), request.getDestinationCountry());

                // Auto-join removed as per request
                // User creator = userRepository.findByEmail(creatorEmail)
                // .orElseThrow(() -> new IllegalArgumentException("User not found"));
                // joinCommunity(community.getId(), creator.getId());

                // We can return response with no specific user context (userId=null) or handle
                // logic differently
                // Since the user is not joined, isMember=false, isModerator=false by default if
                // we pass random string or null details
                // mapToCommunityResponse(community, creator.getId()); <-- this relies on
                // creatorId for "isMember" check.

                // Let's modify mapToCommunityResponse to handle null userId gracefully
                return mapToCommunityResponse(community, null);
        }

        /**
         * Get all communities
         */
        public List<CommunityResponse> getAllCommunities(String userEmail) {
                User user = userRepository.findByEmail(userEmail)
                                .orElseThrow(() -> new IllegalArgumentException("User not found"));

                List<Community> communities = communityRepository.findByIsActiveTrue();

                return communities.stream()
                                .map(community -> mapToCommunityResponse(community, user.getId()))
                                .collect(Collectors.toList());
        }

        /**
         * Get communities for current user (based on origin/destination)
         */
        public List<CommunityResponse> getUserCommunities(String userId) {
                User user = userRepository.findById(userId)
                                .orElseThrow(() -> new IllegalArgumentException("User not found"));

                // Find community matching user's migration route
                List<Community> communities = new ArrayList<>(
                                communityRepository.findByOriginCountryAndDestinationCountry(
                                                user.getCountryOfOrigin(),
                                                user.getDestinationCountry()).map(List::of).orElse(List.of()));

                // Also get communities user has joined
                List<CommunityMembership> memberships = membershipRepository.findByUserId(user.getId());
                List<String> communityIds = memberships.stream()
                                .map(CommunityMembership::getCommunityId)
                                .collect(Collectors.toList());

                List<Community> joinedCommunities = communityRepository.findAllById(communityIds);

                // Combine and remove duplicates
                communities.addAll(joinedCommunities);
                communities = communities.stream().distinct().collect(Collectors.toList());

                return communities.stream()
                                .map(community -> mapToCommunityResponse(community, user.getId()))
                                .collect(Collectors.toList());
        }

        /**
         * Get community by ID
         */
        public CommunityResponse getCommunityById(String communityId, String userEmail) {
                User user = userRepository.findByEmail(userEmail)
                                .orElseThrow(() -> new IllegalArgumentException("User not found"));

                Community community = communityRepository.findById(communityId)
                                .orElseThrow(() -> new IllegalArgumentException("Community not found"));

                return mapToCommunityResponse(community, user.getId());
        }

        /**
         * Get members of a community
         */
        public CommunityMemberResponse getCommunityMembers(String communityId, String userEmail) {
                // Verify user exists
                User user = userRepository.findByEmail(userEmail)
                                .orElseThrow(() -> new IllegalArgumentException("User not found"));

                // Verify community exists
                Community community = communityRepository.findById(communityId)
                                .orElseThrow(() -> new IllegalArgumentException("Community not found"));

                // Get all memberships
                List<CommunityMembership> memberships = membershipRepository.findByCommunityId(communityId);

                // Get user details for each member
                List<String> memberUserIds = memberships.stream()
                                .map(CommunityMembership::getUserId)
                                .collect(Collectors.toList());

                List<User> memberUsers = userRepository.findAllById(memberUserIds);

                // Map to response
                List<MemberResponse> members = memberships.stream()
                                .map(membership -> {
                                        User memberUser = memberUsers.stream()
                                                        .filter(u -> u.getId().equals(membership.getUserId()))
                                                        .findFirst()
                                                        .orElse(null);

                                        if (memberUser == null)
                                                return null;

                                        return MemberResponse.builder()
                                                        .userId(memberUser.getId())
                                                        .fullName(memberUser.getFullName())
                                                        .avatarUrl(memberUser.getAvatarUrl())
                                                        .bio(memberUser.getBio())
                                                        .location(memberUser.getLocation())
                                                        .isVerified(memberUser.getIsVerified())
                                                        .isHelper(memberUser.getIsHelper())
                                                        .isModerator(membership.getIsModerator())
                                                        .rating(memberUser.getRating())
                                                        .joinedAt(membership.getJoinedAt())
                                                        .lastActiveAt(membership.getLastActiveAt())
                                                        .build();
                                })
                                .filter(member -> member != null)
                                .collect(Collectors.toList());

                return CommunityMemberResponse.builder()
                                .community(mapToCommunityResponse(community, user.getId()))
                                .members(members)
                                .totalMembers(members.size())
                                .build();
        }

        /**
         * Join a community
         */
        @Transactional
        public void joinCommunity(String communityId, String userId) {
                User user = userRepository.findById(userId)
                                .orElseThrow(() -> new IllegalArgumentException("User not found"));

                Community community = communityRepository.findById(communityId)
                                .orElseThrow(() -> new IllegalArgumentException("Community not found"));

                // Check if already a member
                membershipRepository.findByUserIdAndCommunityId(user.getId(), communityId)
                                .ifPresent(m -> {
                                        throw new IllegalArgumentException("Already a member of this community");
                                });

                // Create membership
                CommunityMembership membership = CommunityMembership.builder()
                                .userId(user.getId())
                                .communityId(communityId)
                                .isModerator(false)
                                .isMuted(false)
                                .joinedAt(LocalDateTime.now())
                                .lastActiveAt(LocalDateTime.now())
                                .build();

                membershipRepository.save(membership);

                // Increment member count
                community.incrementMemberCount();
                communityRepository.save(community);

                log.info("User {} joined community {}", user.getEmail(), community.getName());
        }

        /**
         * Leave a community
         */
        @Transactional
        public void leaveCommunity(String communityId, String userId) {
                User user = userRepository.findById(userId)
                                .orElseThrow(() -> new IllegalArgumentException("User not found"));

                Community community = communityRepository.findById(communityId)
                                .orElseThrow(() -> new IllegalArgumentException("Community not found"));

                // Check if member
                CommunityMembership membership = membershipRepository
                                .findByUserIdAndCommunityId(user.getId(), communityId)
                                .orElseThrow(() -> new IllegalArgumentException("Not a member of this community"));

                // Delete membership
                membershipRepository.delete(membership);

                // Decrement member count
                community.decrementMemberCount();
                communityRepository.save(community);

                log.info("User {} left community {}", user.getEmail(), community.getName());
        }

        /**
         * Auto-assign user to communities based on origin/destination
         */
        @Transactional
        public void autoAssignUserToCommunities(String userEmail) {
                User user = userRepository.findByEmail(userEmail)
                                .orElseThrow(() -> new IllegalArgumentException("User not found"));

                // Find matching community
                communityRepository.findByOriginCountryAndDestinationCountry(
                                user.getCountryOfOrigin(),
                                user.getDestinationCountry()).ifPresent(community -> {
                                        // Check if not already a member
                                        if (membershipRepository
                                                        .findByUserIdAndCommunityId(user.getId(), community.getId())
                                                        .isEmpty()) {
                                                try {
                                                        joinCommunity(community.getId(), user.getId());
                                                        log.info("Auto-assigned user {} to community {}", userEmail,
                                                                        community.getName());
                                                } catch (Exception e) {
                                                        log.error("Failed to auto-assign user to community", e);
                                                }
                                        }
                                });
        }

        /**
         * Delete a community
         */
        @Transactional
        public void deleteCommunity(String communityId) {
                Community community = communityRepository.findById(communityId)
                                .orElseThrow(() -> new IllegalArgumentException("Community not found"));

                // Delete all memberships
                List<CommunityMembership> memberships = membershipRepository.findByCommunityId(communityId);
                membershipRepository.deleteAll(memberships);

                // Delete messages (optional, if you have a message service/repo we should
                // delete them too)
                // For now just deleting community entity
                communityRepository.delete(community);
                log.info("Community deleted: {}", communityId);
        }

        /**
         * Map Community entity to CommunityResponse DTO
         */
        private CommunityResponse mapToCommunityResponse(Community community, String userId) {
                // Check if user is a member
                boolean isMember = false;
                boolean isModerator = false;

                if (userId != null) {
                        isMember = membershipRepository.findByUserIdAndCommunityId(userId, community.getId())
                                        .isPresent();
                        isModerator = membershipRepository.findByUserIdAndCommunityId(userId, community.getId())
                                        .map(CommunityMembership::getIsModerator)
                                        .orElse(false);
                }

                return CommunityResponse.builder()
                                .id(community.getId())
                                .name(community.getName())
                                .originCountry(community.getOriginCountry())
                                .destinationCountry(community.getDestinationCountry())
                                .description(community.getDescription())
                                .rules(community.getRules())
                                .coverImageUrl(community.getCoverImageUrl())
                                .memberCount(community.getMemberCount())
                                .isActive(community.getIsActive())
                                .isMember(isMember)
                                .isModerator(isModerator)
                                .createdAt(community.getCreatedAt())
                                .updatedAt(community.getUpdatedAt())
                                .build();
        }
}