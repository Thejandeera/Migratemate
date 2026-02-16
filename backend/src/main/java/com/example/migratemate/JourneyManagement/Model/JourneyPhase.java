package com.example.migratemate.JourneyManagement.Model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class JourneyPhase {
    private String phaseName;
    private String aiAdvice;
    private List<ServiceRecommendation> recommendedServices;
}
