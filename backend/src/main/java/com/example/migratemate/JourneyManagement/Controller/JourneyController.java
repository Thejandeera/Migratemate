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
}
