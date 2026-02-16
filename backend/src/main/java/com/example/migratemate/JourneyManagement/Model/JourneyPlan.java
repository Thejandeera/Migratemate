package com.example.migratemate.JourneyManagement.Model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class JourneyPlan {
    private String planId;
    private String summary;
    private List<JourneyPhase> phases;
}
