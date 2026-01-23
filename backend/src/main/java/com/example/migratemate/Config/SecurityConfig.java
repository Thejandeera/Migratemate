package com.example.migratemate.Config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import jakarta.servlet.http.HttpServletResponse;
import java.util.List;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
@Slf4j // Adds Logging Capability
public class SecurityConfig {

    private final AuthenticationProvider authenticationProvider;
    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    @Value("${frontend.url}")
    private String frontendUrl;

    @Value("${spring.security.oauth2.resourceserver.jwt.issuer-uri}")
    private String issuerUri;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        log.info("🔒 Initializing Security Filter Chain...");

        http
                .csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))

                // Set session management to stateless
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                // Set permissions on endpoints
                .authorizeHttpRequests(authz -> authz
                        // 1. Allow CORS Preflight Requests (Critical for Frontend)
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        // 2. Public Endpoints (Legacy or Admin)
                        .requestMatchers(
                                "/api/users/register",
                                "/api/users/login",
                                "/api/admin/login",
                                "/api/admin/register"
                        ).permitAll()

                        // 3. SECURED ENDPOINTS
                        // Note: /api/users/auth/sync is NOT listed above, so it falls into .authenticated()
                        // This is correct! We want it to require a valid Token.
                        .anyRequest().authenticated()
                )

                // 4. Exception Handling (Logs why requests fail)
                .exceptionHandling(ex -> ex.authenticationEntryPoint(unauthorizedEntryPoint()))

                // 5. Add Filters
                // Legacy Filter (Internal Microservices)
                .authenticationProvider(authenticationProvider)
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)

                // Asgardeo Filter (Frontend Users)
                .oauth2ResourceServer(oauth2 -> oauth2.jwt(jwt -> jwt.decoder(
                        org.springframework.security.oauth2.jwt.JwtDecoders.fromIssuerLocation(issuerUri)
                )));

        return http.build();
    }

    /**
     * Custom Entry Point to LOG why authentication failed
     */
    @Bean
    public AuthenticationEntryPoint unauthorizedEntryPoint() {
        return (request, response, authException) -> {
            log.error("⛔ Unauthorized Error: {} - Path: {}", authException.getMessage(), request.getRequestURI());
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Error: Unauthorized");
        };
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        log.info("🌍 Configuring CORS for Frontend URL: {}", frontendUrl);

        CorsConfiguration config = new CorsConfiguration();
        config.setAllowCredentials(true);

        // Allow all common development ports
        config.setAllowedOrigins(List.of(
                frontendUrl,               // From .env
                "http://localhost:5173",   // Vite default
                "http://localhost:3000",   // React default
                "http://localhost:5174"    // Vite alternative
        ));

        config.setAllowedHeaders(List.of("Authorization", "Content-Type", "X-Requested-With"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}