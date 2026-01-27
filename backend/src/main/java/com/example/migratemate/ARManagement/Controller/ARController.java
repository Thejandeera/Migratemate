package com.example.migratemate.ARManagement.Controller;

import com.example.migratemate.ARManagement.Service.ARService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/ar")
@CrossOrigin(origins = "${frontend.url}")
public class ARController {

    @Autowired
    private ARService arService;

    @PostMapping("/analyze")
    public ResponseEntity<Map<String, String>> analyzeImage(@RequestParam("image") MultipartFile image,
            @RequestParam(value = "userId", required = false) String userId) {
        try {
            Map<String, String> result = arService.analyzeImage(image, userId);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Failed to analyze image: " + e.getMessage()));
        }
    }
}
