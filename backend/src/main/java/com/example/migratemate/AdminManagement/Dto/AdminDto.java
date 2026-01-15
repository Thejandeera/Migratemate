package com.example.migratemate.AdminManagement.Dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

public class AdminDto {

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class AdminRequest {
        private String firstName;
        private String lastName;
        private String email;
        private String password;
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class AdminLoginRequest {
        private String email;
        private String password;
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class AdminResponse {
        private String id;
        private String firstName;
        private String lastName;
        private String fullName;
        private String email;
        private String status;
        private LocalDateTime createdData;
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class AdminLoginResponse {
        private String token;
        private String refreshToken;
        private AdminResponse admin;
    }
}
