package com.jobsearch.posting.exception;

import com.jobsearch.posting.dto.ErrorEnvelope;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.util.Map;
import java.util.stream.Collectors;

@ControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorEnvelope> handleNotFound(IllegalArgumentException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ErrorEnvelope.of("NOT_FOUND", ex.getMessage()));
    }

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<ErrorEnvelope> handleConflict(IllegalStateException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(ErrorEnvelope.of("CONFLICT", ex.getMessage()));
    }

    @ExceptionHandler(SecurityException.class)
    public ResponseEntity<ErrorEnvelope> handleForbidden(SecurityException ex) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(ErrorEnvelope.of("FORBIDDEN", ex.getMessage()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorEnvelope> handleValidation(MethodArgumentNotValidException ex) {
        Map<String, String> errors = ex.getBindingResult().getFieldErrors().stream()
                .collect(Collectors.toMap(
                        e -> e.getField(),
                        e -> e.getDefaultMessage() != null ? e.getDefaultMessage() : "invalid",
                        (a, b) -> a
                ));
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ErrorEnvelope.of("VALIDATION_ERROR", "Request validation failed", errors));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorEnvelope> handleGeneral(Exception ex) {
        log.error("Unhandled exception", ex);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ErrorEnvelope.of("INTERNAL_ERROR", "An unexpected error occurred"));
    }
}
