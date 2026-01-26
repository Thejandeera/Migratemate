package com.example.migratemate.CommunityManagement.WebSocket;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.*;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    /**
     * Register STOMP endpoints that clients will connect to
     */
    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // Endpoint for WebSocket connection
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*") // Allow all origins for development
                .withSockJS(); // Enable SockJS fallback for browsers without WebSocket support
    }

    /**
     * Configure message broker for routing messages
     */
    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        // Enable simple in-memory broker for sending messages to subscribed clients
        registry.enableSimpleBroker("/topic", "/queue");

        // Prefix for messages FROM clients TO server
        registry.setApplicationDestinationPrefixes("/app");

        // Prefix for messages FROM server TO specific user
        registry.setUserDestinationPrefix("/user");
    }
}   