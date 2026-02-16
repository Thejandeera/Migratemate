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

    @Value("${gemini.api.key}")
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

        // 1. Fetch Context Data
        String serviceContext = serviceRepository.findAll().stream()
                .map(s -> s.getTitle() + " (" + s.getCategory() + ")")
                .collect(Collectors.joining(", "));

        String communityContext = communityRepository.findAll().stream()
                .map(c -> c.getName() + ": " + c.getDescription())
                .collect(Collectors.joining("; "));

        // Only fetch booking context if userId is valid
        String bookingContext = "No bookings found.";
        String arContext = "No AR history found.";

        if (userId != null && !userId.equals("undefined") && !userId.equals("null")) {
            bookingContext = bookingRepository.findByCustomerIdOrderByCreatedAtDesc(userId).stream() // Corrected method
                                                                                                     // call //
                                                                                                     // identifying by
                                                                                                     // repo check
                                                                                                     // earlier
                    .map(b -> "Booking for " + b.getServiceTitle() + " on " + b.getRequestedDate() + " status: "
                            + b.getStatus())
                    .collect(Collectors.joining("; "));

            arContext = arHistoryRepository.findByUserId(userId).stream()
                    .map(ar -> "scanned: " + ar.getName() + " at " + ar.getLocation())
                    .collect(Collectors.joining("; "));
        }

        // 2. Construct Prompt
        String systemInstruction = "You are a personal AI Assistant for MigrateMate, an app helping migrants settle in Australia. "
                +
                "You have access to the following real-time data:\n" +
                "Available Services: " + serviceContext + "\n" +
                "User Bookings: " + bookingContext + "\n" +
                "Communities: " + communityContext + "\n" +
                "User's AR Scans History: " + arContext + "\n" +
                "Answer the user's question accurately based on this data. Be helpful, concise, and friendly. " +
                "If the user asks about something not in the data, try to be generally helpful about migrating to Australia.";

        String requestBody = "{"
                + "\"contents\": [{"
                + "\"parts\": ["
                + "{\"text\": \"" + systemInstruction.replace("\"", "'") + "\\n\\nUser: "
                + userMessage.replace("\"", "'") + "\"}"
                + "]"
                + "}]"
                + "}";

        // 3. Call Gemini API
        RestTemplate restTemplate = new RestTemplate();
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<String> entity = new HttpEntity<>(requestBody, headers);

        String url = GEMINI_API_URL + geminiApiKey;
        String assistantResponse = "I'm having trouble connecting right now. Please try again later.";

        try {
            ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);
            ObjectMapper mapper = new ObjectMapper();
            JsonNode root = mapper.readTree(response.getBody());
            assistantResponse = root.path("candidates").get(0).path("content").path("parts").get(0).path("text")
                    .asText();

            // Increment usage only on successful response
            chatLimitService.incrementUserChat(userId);

        } catch (Exception e) {
            e.printStackTrace();
            assistantResponse = "Sorry, I encountered an error while processing your request.";
        }

        // 4. Save Chat History
        if (userId != null && !userId.equals("undefined")) {
            ChatHistory history = new ChatHistory(userId, userMessage, assistantResponse);
            chatHistoryRepository.save(history);
            return history;
        } else {
            return new ChatHistory("guest", userMessage, assistantResponse);
        }
    }

    public List<ChatHistory> getHistory(String userId) {
        return chatHistoryRepository.findByUserId(userId);
    }
}
