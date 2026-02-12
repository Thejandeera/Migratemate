package com.example.migratemate.BookingManagement.Repository;

import com.example.migratemate.BookingManagement.Model.Booking;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BookingRepository extends MongoRepository<Booking, String> {
    List<Booking> findByCustomerIdOrderByCreatedAtDesc(String customerId);
    List<Booking> findByProviderIdOrderByCreatedAtDesc(String providerId);
}
