package com.jobsearch.search.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
public class WebClientConfig {

    @Value("${job-posting-service.url:http://localhost:8081}")
    private String jobPostingServiceUrl;

    @Bean
    public WebClient jobPostingWebClient() {
        return WebClient.builder()
                .baseUrl(jobPostingServiceUrl)
                .build();
    }
}
