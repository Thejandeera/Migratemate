package com.example.migratemate.BookingManagement.Dto;

import lombok.Data;

import java.util.Date;

@Data
public class CreateBookingRequest {
    private String serviceId;
    private Date date;
    private String notes;
}
