package com.example.migratemate.JourneyManagement.Model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ServiceRecommendation {
    private String serviceId;
    private String title;
    private Double price;
    private String providerId;
    private String category;
}
