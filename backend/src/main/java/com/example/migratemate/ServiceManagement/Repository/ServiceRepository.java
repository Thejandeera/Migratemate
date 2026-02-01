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

    @Query("{ 'isActive': true, $and: [ " +
            "{ $or: [ { $expr: { $eq: [?0, null] } }, { 'category': ?0 } ] }, " +
            "{ $or: [ { $expr: { $eq: [?1, null] } }, { 'origin': { $regex: ?1, $options: 'i' } } ] }, " +
            "{ $or: [ { $expr: { $eq: [?2, null] } }, { 'destination': { $regex: ?2, $options: 'i' } } ] } " +
            "] }")
    List<ServiceEntity> searchWithFilters(String category, String origin, String destination);
}
