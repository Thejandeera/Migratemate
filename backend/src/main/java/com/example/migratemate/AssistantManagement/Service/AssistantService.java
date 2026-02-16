package com.example.migratemate.AssistantManagement.Service;

import com.example.migratemate.ARManagement.Repository.ARHistoryRepository;
import com.example.migratemate.AssistantManagement.Model.ChatHistory;
import com.example.migratemate.AssistantManagement.Repository.ChatHistoryRepository;
import com.example.migratemate.BookingManagement.Repository.BookingRepository;
import com.example.migratemate.CommunityManagement.Repository.CommunityRepository;
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

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AssistantService {

    @Value("${my.key}")
    private String geminiApiKey;

    private final String GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=";

    @Autowired
    private ChatHistoryRepository chatHistoryRepository;

    @Autowired
    private ServiceRepository serviceRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private CommunityRepository communityRepository;

    @Autowired
    private ARHistoryRepository arHistoryRepository;

    @Autowired
    private ChatLimitService chatLimitService;

    public ChatHistory processChat(String userId, String userMessage) {
        // Check Limit
        if (!chatLimitService.canUserChat(userId)) {
            return new ChatHistory(userId, userMessage, "You have reached your limit of 10 free chats.");
        }

        // 1. Fetch Context Data (Enhanced)
        // Services: specific focus on active ones and details
        String serviceContext = serviceRepository.findByIsActiveTrue().stream()
                .map(s -> String.format("%s (%s) - %s [Origin: %s, Dest: %s, Price: $%.2f]",
                        s.getTitle(), s.getCategory(), s.getDescription(), s.getOrigin(), s.getDestination(),
                        s.getPrice()))
                .collect(Collectors.joining("; "));

        // Communities: specific focus on active ones
        String communityContext = communityRepository.findByIsActiveTrue().stream()
                .map(c -> String.format("%s (from %s to %s): %s",
                        c.getName(), c.getOriginCountry(), c.getDestinationCountry(), c.getDescription()))
                .collect(Collectors.joining("; "));

        // Bookings (Existing logic + Provider logic)
        String bookingContext = "No bookings found.";
        String arContext = "No AR history found.";

        if (userId != null && !userId.equals("undefined") && !userId.equals("null")) {
            String customerBookings = bookingRepository.findByCustomerIdOrderByCreatedAtDesc(userId).stream()
                    .map(b -> String.format("Ref:%s Service:%s Date:%s Status:%s", b.getId(), b.getServiceTitle(),
                            b.getRequestedDate(), b.getStatus()))
                    .collect(Collectors.joining("; "));

            String providerBookings = bookingRepository.findByProviderIdOrderByCreatedAtDesc(userId).stream()
                    .map(b -> String.format("Ref:%s Client:%s Service:%s Date:%s Status:%s", b.getId(),
                            b.getCustomerName(), b.getServiceTitle(), b.getRequestedDate(), b.getStatus()))
                    .collect(Collectors.joining("; "));

            if (!customerBookings.isEmpty() || !providerBookings.isEmpty()) {
                bookingContext = "Your Bookings: " + (customerBookings.isEmpty() ? "None" : customerBookings) +
                        " | Your Client Orders: " + (providerBookings.isEmpty() ? "None" : providerBookings);
            }

            arContext = arHistoryRepository.findByUserId(userId).stream()
                    .map(ar -> "scanned: " + ar.getName() + " at " + ar.getLocation())
                    .collect(Collectors.joining("; "));
        }

        System.out.println("DEBUG: Context Built. Services: " + serviceContext.length() + " chars, Communities: "
                + communityContext.length() + " chars.");

        // 2. Construct Prompt safely using ObjectMapper
        try {
            ObjectMapper mapper = new ObjectMapper();

            String systemInstruction = "You are a personal AI Assistant for MigrateMate. "
                    + "Data availability:\n"
                    + "AVAILABLE SERVICES: " + serviceContext + "\n\n"
                    + "COMMUNITIES: " + communityContext + "\n\n"
                    + "USER BOOKINGS/ORDERS: " + bookingContext + "\n\n"
                    + "AR HISTORY: " + arContext + "\n\n"
                    + "Answer based on this data. If providing a service, mention price and origin/destination. Be helpful and friendly.";

            // Build JSON structure: { "contents": [ { "parts": [ { "text": "..." } ] } ] }
            var part = mapper.createObjectNode().put("text", systemInstruction + "\n\nUser Question: " + userMessage);
            var parts = mapper.createArrayNode().add(part);
            var content = mapper.createObjectNode().set("parts", parts);
            var contents = mapper.createArrayNode().add(content);
            var requestBodyNode = mapper.createObjectNode().set("contents", contents);

            String requestBody = mapper.writeValueAsString(requestBodyNode);

            // 3. Call Gemini API
            RestTemplate restTemplate = new RestTemplate();
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<String> entity = new HttpEntity<>(requestBody, headers);
            String url = GEMINI_API_URL + geminiApiKey;

            ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);
            JsonNode root = mapper.readTree(response.getBody());
            String assistantResponse = root.path("candidates").get(0).path("content").path("parts").get(0).path("text")
                    .asText();

            // Increment usage
            chatLimitService.incrementUserChat(userId);

            // 4. Save History
            if (userId != null && !userId.equals("undefined")) {
                ChatHistory history = new ChatHistory(userId, userMessage, assistantResponse);
                chatHistoryRepository.save(history);
                return history;
            } else {
                return new ChatHistory("guest", userMessage, assistantResponse);
            }

        } catch (Exception e) {
            e.printStackTrace();
            return new ChatHistory(userId, userMessage, "Sorry, I encountered an internal error. Please try again.");
        }
    }

    public List<ChatHistory> getHistory(String userId) {
        return chatHistoryRepository.findByUserId(userId);
    }
}
