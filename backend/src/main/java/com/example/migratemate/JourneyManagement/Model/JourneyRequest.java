package com.example.migratemate.JourneyManagement.Model;

import lombok.Data;

@Data
public class JourneyRequest {
    private String origin;
    private String destination;
    private Double budget;
    private Integer timelineWeeks;
    private Integer familySize;
}
