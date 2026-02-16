package com.example.migratemate.JourneyManagement.Model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;
import java.util.List;

@Data
@Document(collection = "journey_plans")
public class JourneyPlanEntity {
    @Id
    private String id;
    private String userId;
    private String planName;
    private String summary;
    private List<JourneyPhase> phases;
    private Double budget;
    private String origin;
    private String destination;
    private Date createdAt;
}
