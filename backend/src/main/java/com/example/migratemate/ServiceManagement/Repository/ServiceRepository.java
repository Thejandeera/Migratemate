package com.example.migratemate.ServiceManagement.Repository;

import com.example.migratemate.ServiceManagement.Entity.ServiceEntity;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ServiceRepository extends MongoRepository<ServiceEntity, String> {

    List<ServiceEntity> findByProviderId(String providerId);

    List<ServiceEntity> findByCategory(String category);

    List<ServiceEntity> findByOriginAndDestination(String origin, String destination);

    List<ServiceEntity> findByIsActiveTrue();

    List<ServiceEntity> findByIsActiveTrueAndIsAvailableTrue();

    List<ServiceEntity> findByCategoryAndIsActiveTrue(String category);

    List<ServiceEntity> findByDestinationContainingIgnoreCase(String destination);

    List<ServiceEntity> findByOriginContainingIgnoreCase(String origin);

    @Query("{ $or: [ { 'title': { $regex: ?0, $options: 'i' } }, { 'description': { $regex: ?0, $options: 'i' } } ], 'isActive': true }")
    List<ServiceEntity> searchByKeyword(String keyword);

    List<ServiceEntity> findByPriceBetweenAndIsActiveTrue(Double minPrice, Double maxPrice);

    // Simple query - filtering will be done in service layer for null handling
    @Query("{ 'isActive': true }")
    List<ServiceEntity> findAllActive();

    // Category-based search
    @Query("{ 'isActive': true, 'category': ?0 }")
    List<ServiceEntity> findByCategoryActive(String category);

    // Origin-based search (case-insensitive)
    @Query("{ 'isActive': true, 'origin': { $regex: ?0, $options: 'i' } }")
    List<ServiceEntity> findByOriginActive(String origin);

    // Destination-based search (case-insensitive)
    @Query("{ 'isActive': true, 'destination': { $regex: ?0, $options: 'i' } }")
    List<ServiceEntity> findByDestinationActive(String destination);
}
