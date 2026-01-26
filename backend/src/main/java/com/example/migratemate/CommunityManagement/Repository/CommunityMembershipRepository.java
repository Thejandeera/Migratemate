package com.example.migratemate.CommunityManagement.Repository;

import com.example.migratemate.CommunityManagement.Entity.CommunityMembership;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CommunityMembershipRepository extends MongoRepository<CommunityMembership, String> {

    // Find all communities a user is part of
    List<CommunityMembership> findByUserId(String userId);

    // Find all members of a community
    List<CommunityMembership> findByCommunityId(String communityId);

    // Check if user is already a member
    Optional<CommunityMembership> findByUserIdAndCommunityId(String userId, String communityId);

    // Count members in a community
    Long countByCommunityId(String communityId);

    // Find moderators of a community
    List<CommunityMembership> findByCommunityIdAndIsModeratorTrue(String communityId);

    // Delete membership
    void deleteByUserIdAndCommunityId(String userId, String communityId);
}