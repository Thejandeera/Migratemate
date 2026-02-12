package com.example.migratemate.BookingManagement.Model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.Date;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "bookings")
public class Booking {
    @Id
    private String id;

    private String serviceId;
    private String serviceTitle; // Snapshot in case service changes
    private Double totalAmount;
    private String currency; // AUD, USD, etc.

    private String customerId; // User who booked
    private String customerName; 
    private String customerAvatar;

    private String providerId; // Helper who owns the service
    private String providerName;
    private String providerAvatar;

    private Date requestedDate;
    private String notes;

    @Builder.Default
    private BookingStatus status = BookingStatus.PENDING;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}
