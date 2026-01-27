package com.example.migratemate.ARManagement.Service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.*;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.Base64;
import java.util.HashMap;
import java.util.Map;
import com.example.migratemate.ARManagement.Model.ARHistory;
import com.example.migratemate.ARManagement.Repository.ARHistoryRepository;
import org.springframework.beans.factory.annotation.Autowired;

@Service
public class ARService {

    @Value("${gemini.api.key}")
    private String geminiApiKey;

    private final String GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=";

    @Autowired
    private ARHistoryRepository arHistoryRepository;

    public Map<String, String> analyzeImage(MultipartFile imageFile, String userId) throws Exception {
        // Encode image to Base64
        String base64Image = Base64.getEncoder().encodeToString(imageFile.getBytes());

        // Construct Request Body
        // Needs proper structure for Gemini API
        String requestBody = "{"
                + "\"contents\": [{"
                + "\"parts\": ["
                + "{\"text\": \"Identify this place or landmark. Provide the Name, correct Location, and a brief Description of its speciality/history. Return JSON format with keys: name, location, description. Do not use markdown blocks.\" },"
                + "{\"inline_data\": {\"mime_type\": \"image/jpeg\", \"data\": \"" + base64Image + "\"}}"
                + "]"
                + "}]"
                + "}";

        // Make Request
        RestTemplate restTemplate = new RestTemplate();
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<String> entity = new HttpEntity<>(requestBody, headers);

        String url = GEMINI_API_URL + geminiApiKey;
        ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.POST, entity, String.class);

        // Parse Response
        ObjectMapper mapper = new ObjectMapper();
        JsonNode root = mapper.readTree(response.getBody());
        String responseText = root.path("candidates").get(0).path("content").path("parts").get(0).path("text").asText();

        // Basic cleanup of response text if it contains markdown code blocks
        responseText = responseText.replace("```json", "").replace("```", "").trim();

        Map<String, String> result;
        try {
            // Try to parse JSON from AI
            result = mapper.readValue(responseText,
                    new com.fasterxml.jackson.core.type.TypeReference<Map<String, String>>() {
                    });
        } catch (Exception e) {
            // Fallback if AI didn't return strict JSON
            result = new HashMap<>();
            result.put("description", responseText);
        }

        // Save to History if userId is present
        if (userId != null && !userId.isEmpty() && !userId.equals("undefined") && !userId.equals("null")) {
            ARHistory history = ARHistory.builder()
                    .userId(userId)
                    .name(result.getOrDefault("name", "Unknown"))
                    .location(result.getOrDefault("location", "Unknown"))
                    .description(result.getOrDefault("description", responseText))
                    .build();
            arHistoryRepository.save(history);
        }

        return result;
    }

}
