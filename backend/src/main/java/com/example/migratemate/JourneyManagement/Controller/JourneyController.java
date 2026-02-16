package com.example.migratemate.JourneyManagement.Controller;

import com.example.migratemate.JourneyManagement.Model.JourneyPlan;
import com.example.migratemate.JourneyManagement.Model.JourneyRequest;
import com.example.migratemate.JourneyManagement.Service.JourneyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/journey")
@CrossOrigin(origins = "${frontend.url}")
public class JourneyController {

    @Autowired
    private JourneyService journeyService;

    @PostMapping("/plan")
    public ResponseEntity<JourneyPlan> generatePlan(@RequestBody JourneyRequest request) {
        return ResponseEntity.ok(journeyService.generatePlan(request));
    }

    @PostMapping("/save")
    public ResponseEntity<com.example.migratemate.JourneyManagement.Model.JourneyPlanEntity> savePlan(
            @RequestBody com.example.migratemate.JourneyManagement.Model.JourneyPlanEntity planEntity) {
        return ResponseEntity.ok(journeyService.savePlan(planEntity));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<java.util.List<com.example.migratemate.JourneyManagement.Model.JourneyPlanEntity>> getUserPlans(
            @PathVariable String userId) {
        return ResponseEntity.ok(journeyService.getUserPlans(userId));
    }
}
