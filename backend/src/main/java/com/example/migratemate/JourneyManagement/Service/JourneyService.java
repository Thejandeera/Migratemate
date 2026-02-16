package com.example.migratemate.JourneyManagement.Service;

import com.example.migratemate.JourneyManagement.Model.*;
import com.example.migratemate.ServiceManagement.Entity.ServiceEntity;
import com.example.migratemate.ServiceManagement.Repository.ServiceRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class JourneyService {

    @Autowired
    private ServiceRepository serviceRepository;

    @Value("${gemini.api.key}")
    private String geminiApiKey;

    private final String GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=";

    public JourneyPlan generatePlan(JourneyRequest request) {
        String planId = UUID.randomUUID().toString();

        // 1. Gather Candidate Services (Data Gathering Sub-Agents)
        // Logistics (Transport)
        List<ServiceEntity> transportServices = serviceRepository.findByCategoryActive("TRANSPORT").stream()
                .filter(s -> isLocationMatch(s, request.getDestination()))
                .limit(5)
                .collect(Collectors.toList());

        // Housing
        List<ServiceEntity> housingServices = serviceRepository.findByCategoryActive("HOUSING").stream()
                .filter(s -> isLocationMatch(s, request.getDestination()))
                .filter(s -> s.getPrice() <= request.getBudget())
                .limit(5)
                .collect(Collectors.toList());

        // Settlement/Legal (General)
        List<ServiceEntity> settlementServices = serviceRepository.findAllActive().stream()
                .filter(s -> s.getCategory().equals("DOCUMENTATION") || s.getCategory().equals("CULTURAL_SUPPORT"))
                .filter(s -> isLocationMatch(s, request.getDestination()) || isLocationMatch(s, request.getOrigin()))
                .limit(5)
                .collect(Collectors.toList());

        List<ServiceEntity> allCandidates = new ArrayList<>();
        allCandidates.addAll(transportServices);
        allCandidates.addAll(housingServices);
        allCandidates.addAll(settlementServices);

        // Map for easy ID lookup later
        Map<String, ServiceEntity> serviceMap = allCandidates.stream()
                .collect(Collectors.toMap(ServiceEntity::getId, s -> s));

        // 2. Construct Prompt for Gemini
        String candidatesJson = allCandidates.stream()
                .map(s -> String.format("{id: '%s', title: '%s', category: '%s', price: %.2f}",
                        s.getId(), s.getTitle(), s.getCategory(), s.getPrice()))
                .collect(Collectors.joining(", ", "[", "]"));

        String prompt = String.format(
                "You are a Smart Migration Journey Planner. Create a %d-week plan for a family of %d moving from %s to %s with a budget of $%.2f. "
                        +
                        "User's Specific Needs/Notes: %s. "
                        +
                        "Use the provided SERVICES to populate the plan. " +
                        "Output ONLY a JSON object with this structure: " +
                        "{ 'summary': '...', 'phases': [ { 'phaseName': '...', 'aiAdvice': 'MARKDOWN STRING: Detailed step-by-step guide. Use bullet points (- ), bold topics (**Topic**), and clear headers.', 'recommendedServiceIds': ['id1', 'id2'] } ] } "
                        +
                        "Make the advice highly detailed, practical, and structured pointwise. "
                        +
                        "CANDIDATE SERVICES: %s",
                request.getTimelineWeeks(), request.getFamilySize(), request.getOrigin(), request.getDestination(),
                request.getBudget(), request.getAdditionalInfo(), candidatesJson);

        // 3. Call Gemini
        String summary = "Plan generated successfully.";
        List<JourneyPhase> phases = new ArrayList<>();

        try {
            String jsonResponse = callGemini(prompt);
            // Parse Gemini Response
            ObjectMapper mapper = new ObjectMapper();
            JsonNode root = mapper.readTree(jsonResponse);

            // Handle markdown code blocks if present ( ```json ... ``` )
            if (root.isTextual()) {
                // In case it returns string content instead of direct JSON (unlikely with this
                // prompt style but safe to check)
                // Doing strict JSON parsing on the 'text' field below
            }

            JsonNode contentNode = root.path("candidates").get(0).path("content").path("parts").get(0).path("text");
            String cleanJson = contentNode.asText().replaceAll("```json", "").replaceAll("```", "").trim();
            JsonNode planNode = mapper.readTree(cleanJson);

            summary = planNode.path("summary").asText();

            for (JsonNode phaseNode : planNode.path("phases")) {
                JourneyPhase phase = new JourneyPhase();
                phase.setPhaseName(phaseNode.path("phaseName").asText());
                phase.setAiAdvice(phaseNode.path("aiAdvice").asText());

                List<ServiceRecommendation> recs = new ArrayList<>();
                if (phaseNode.has("recommendedServiceIds")) {
                    for (JsonNode idNode : phaseNode.path("recommendedServiceIds")) {
                        String sId = idNode.asText();
                        if (serviceMap.containsKey(sId)) {
                            ServiceEntity s = serviceMap.get(sId);
                            recs.add(new ServiceRecommendation(s.getId(), s.getTitle(), s.getPrice(), s.getProviderId(),
                                    s.getCategory()));
                        }
                    }
                }
                phase.setRecommendedServices(recs);
                phases.add(phase);
            }

        } catch (Exception e) {
            e.printStackTrace();
            summary = "Error generating full AI plan. Providing raw search results.";
            // Fallback: Create a simple 1-phase plan with all candidates
            JourneyPhase fallbackPhase = new JourneyPhase("General Recommendations",
                    "We encountered an error processing the personalized plan. Here are some services that fit your criteria.",
                    allCandidates.stream().map(s -> new ServiceRecommendation(s.getId(), s.getTitle(), s.getPrice(),
                            s.getProviderId(), s.getCategory())).collect(Collectors.toList()));
            phases.add(fallbackPhase);
        }

        return new JourneyPlan(planId, summary, phases);
    }

    private boolean isLocationMatch(ServiceEntity service, String userLocation) {
        if (userLocation == null)
            return false;
        String origin = service.getOrigin() != null ? service.getOrigin().toLowerCase() : "";
        String dest = service.getDestination() != null ? service.getDestination().toLowerCase() : "";
        String loc = userLocation.toLowerCase();
        return origin.contains(loc) || dest.contains(loc);
    }

    private String callGemini(String prompt) {
        try {
            ObjectMapper mapper = new ObjectMapper();

            var part = mapper.createObjectNode().put("text", prompt);
            var parts = mapper.createArrayNode().add(part);
            var content = mapper.createObjectNode().set("parts", parts);
            var contents = mapper.createArrayNode().add(content);
            var requestBodyNode = mapper.createObjectNode().set("contents", contents);

            String requestBody = mapper.writeValueAsString(requestBodyNode);

            RestTemplate restTemplate = new RestTemplate();
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<String> entity = new HttpEntity<>(requestBody, headers);
            String url = GEMINI_API_URL + geminiApiKey;

            ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);
            return response.getBody();
        } catch (Exception e) {
            throw new RuntimeException("Gemini Call Failed", e);
        }
    }
}
