package com.example.migratemate.SosManagement.Dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SosResponse {
    private String id;
    private String userId;
    private String userName;
    private String userEmail;
    private String userPhone;
    private String userAvatar;
    private Double latitude;
    private Double longitude;
    private String address;
    private String message;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime resolvedAt;
    private String helperId;
    private String helperName;
}