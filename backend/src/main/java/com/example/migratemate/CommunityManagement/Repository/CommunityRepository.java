package com.example.migratemate.CommunityManagement.Repository;

import com.example.migratemate.CommunityManagement.Entity.Community;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CommunityRepository extends MongoRepository<Community, String> {

    // Find community by exact origin and destination
    Optional<Community> findByOriginCountryAndDestinationCountry(String originCountry, String destinationCountry);

    // Find all communities for a specific destination
    List<Community> findByDestinationCountry(String destinationCountry);

    // Find all communities for a specific origin
    List<Community> findByOriginCountry(String originCountry);

    // Find active communities
    List<Community> findByIsActiveTrue();

    // Find communities managed by agency
    List<Community> findByManagedByAgencyId(String agencyId);
}