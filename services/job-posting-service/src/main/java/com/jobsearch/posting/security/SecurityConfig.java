package com.jobsearch.posting.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final FirebaseAuthFilter firebaseAuthFilter;

    public SecurityConfig(FirebaseAuthFilter firebaseAuthFilter) {
        this.firebaseAuthFilter = firebaseAuthFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .addFilterBefore(firebaseAuthFilter, UsernamePasswordAuthenticationFilter.class)
                .authorizeHttpRequests(auth -> auth
                        // Public endpoints
                        .requestMatchers(HttpMethod.GET, "/api/v1/jobs/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/companies/**").permitAll()
                        // Swagger/OpenAPI
                        .requestMatchers("/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html").permitAll()
                        // Health check
                        .requestMatchers("/actuator/**").permitAll()
                        // Company management - ADMIN only
                        .requestMatchers(HttpMethod.POST, "/api/v1/companies").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PATCH, "/api/v1/companies/**").hasAnyRole("ADMIN", "COMPANY")
                        // Job management - ADMIN or COMPANY
                        .requestMatchers(HttpMethod.POST, "/api/v1/jobs").hasAnyRole("ADMIN", "COMPANY")
                        .requestMatchers(HttpMethod.PATCH, "/api/v1/jobs/**").hasAnyRole("ADMIN", "COMPANY")
                        .requestMatchers(HttpMethod.DELETE, "/api/v1/jobs/**").hasAnyRole("ADMIN", "COMPANY")
                        // Everything else requires authentication
                        .anyRequest().authenticated()
                );

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of("http://localhost:5173", "http://localhost:3000"));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
