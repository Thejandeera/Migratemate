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

@Service
public class ARService {

    @Value("${gemini.api.key}")
    private String geminiApiKey;

    private final String GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=";

    public Map<String, String> analyzeImage(MultipartFile imageFile) throws Exception {
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

        try {
            // Try to parse JSON from AI
            Map<String, String> result = mapper.readValue(responseText,
                    new com.fasterxml.jackson.core.type.TypeReference<Map<String, String>>() {
                    });
            return result;
        } catch (Exception e) {
            // Fallback if AI didn't return strict JSON
            Map<String, String> fallback = new HashMap<>();
            fallback.put("description", responseText);
            return fallback;
        }
    }
}
