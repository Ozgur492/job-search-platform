package com.jobsearch.posting.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

import java.io.ByteArrayInputStream;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;

@Configuration
public class FirebaseConfig {

    private static final Logger log = LoggerFactory.getLogger(FirebaseConfig.class);

    @Value("${firebase.credentials.path:}")
    private String credentialsPath;

    @Value("${firebase.credentials.json:}")
    private String credentialsJson;

    @PostConstruct
    public void init() {
        if (FirebaseApp.getApps().isEmpty()) {
            try {
                FirebaseOptions options;
                if (credentialsJson != null && !credentialsJson.isBlank()) {
                    InputStream stream = new ByteArrayInputStream(credentialsJson.getBytes());
                    options = FirebaseOptions.builder()
                            .setCredentials(GoogleCredentials.fromStream(stream))
                            .build();
                    log.info("Firebase initialized from FIREBASE_CREDENTIALS_JSON");
                } else if (credentialsPath != null && !credentialsPath.isBlank()) {
                    InputStream stream = new FileInputStream(credentialsPath);
                    options = FirebaseOptions.builder()
                            .setCredentials(GoogleCredentials.fromStream(stream))
                            .build();
                    log.info("Firebase initialized from FIREBASE_CREDENTIALS_PATH: {}", credentialsPath);
                } else {
                    log.warn("No Firebase credentials configured. Firebase auth will not work.");
                    return;
                }
                FirebaseApp.initializeApp(options);
            } catch (IOException e) {
                log.error("Failed to initialize Firebase", e);
            }
        }
    }
}
