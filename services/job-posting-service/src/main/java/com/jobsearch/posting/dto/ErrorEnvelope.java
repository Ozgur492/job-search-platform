package com.jobsearch.posting.dto;

public record ErrorEnvelope(ErrorBody error) {
    public record ErrorBody(String code, String message, Object details) {}

    public static ErrorEnvelope of(String code, String message) {
        return new ErrorEnvelope(new ErrorBody(code, message, null));
    }

    public static ErrorEnvelope of(String code, String message, Object details) {
        return new ErrorEnvelope(new ErrorBody(code, message, details));
    }
}
