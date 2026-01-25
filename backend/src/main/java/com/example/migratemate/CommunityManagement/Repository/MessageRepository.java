package com.example.migratemate.CommunityManagement.Repository;

import com.example.migratemate.CommunityManagement.Entity.Message;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface MessageRepository extends MongoRepository<Message, String> {

    // Get community chat history (paginated)
    Page<Message> findByCommunityIdAndIsDeletedFalseOrderByTimestampDesc(String communityId, Pageable pageable);

    // Get direct messages between two users (paginated)
    Page<Message> findBySenderIdAndRecipientIdOrRecipientIdAndSenderIdAndIsDeletedFalseOrderByTimestampDesc(
            String senderId1, String recipientId1, String senderId2, String recipientId2, Pageable pageable);

    // Get recent messages in a community
    List<Message> findTop50ByCommunityIdAndIsDeletedFalseOrderByTimestampDesc(String communityId);

    // Count unread messages for a user in a community (messages after a timestamp)
    Long countByCommunityIdAndTimestampAfter(String communityId, LocalDateTime after);
}