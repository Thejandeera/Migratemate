package com.example.migratemate.BookingManagement.Dto;

import com.example.migratemate.BookingManagement.Model.BookingStatus;
import lombok.Builder;
import lombok.Data;

import java.util.Date;

@Data
@Builder
public class BookingResponse {
    private String id;
    private String serviceId;
    private String serviceTitle;
    private Double totalAmount;
    private String currency;

    private String providerId;
    private String providerName;
    private String providerAvatar;
    private String providerPhone;
    private String providerEmail;

    private String customerId;
    private String customerName;
    private String customerAvatar;
    private String customerPhone;
    private String customerEmail;

    private Date requestedDate;
    private String notes;
    private BookingStatus status;

    private Date createdAt;
}
