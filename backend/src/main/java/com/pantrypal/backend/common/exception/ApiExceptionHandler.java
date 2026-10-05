package com.pantrypal.backend.common.exception;

import java.time.Instant;
import java.util.LinkedHashMap;
import org.springframework.http.*;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.ErrorResponse;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;

@RestControllerAdvice
public class ApiExceptionHandler {
    @ExceptionHandler(MethodArgumentNotValidException.class)
    ResponseEntity<ApiError> validation(MethodArgumentNotValidException exception) {
        var fields = new LinkedHashMap<String, String>();
        exception.getBindingResult().getFieldErrors().forEach(error -> fields.putIfAbsent(error.getField(),
                "Invalid value."));
        return response(new ApiError(Instant.now(), 400, "INVALID_REQUEST", "Check the submitted fields.", fields));
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    ResponseEntity<ApiError> malformed() {
        return response(ApiError.of(400, "INVALID_REQUEST", "A valid JSON request body is required."));
    }

    @ExceptionHandler(AuthenticationException.class)
    ResponseEntity<ApiError> authentication() {
        // Includes DisabledException; do not reveal account existence or status to anonymous callers.
        return response(ApiError.of(401, "INVALID_CREDENTIALS", "Unable to sign in with these credentials."));
    }

    @ExceptionHandler(InvalidRefreshTokenException.class)
    ResponseEntity<ApiError> refresh() {
        return response(ApiError.of(401, "INVALID_REFRESH_TOKEN", "Invalid or expired refresh token."));
    }

    @ExceptionHandler(AccessDeniedException.class)
    ResponseEntity<ApiError> forbidden() {
        return response(ApiError.of(403, "FORBIDDEN", "You do not have permission to perform this operation."));
    }

    @ExceptionHandler(Exception.class)
    ResponseEntity<ApiError> unexpected(Exception exception) {
        if (exception instanceof ErrorResponse error) {
            int status = error.getStatusCode().value();
            return response(ApiError.of(status, "REQUEST_FAILED", "The request could not be processed."));
        }
        // Never serialize exception messages, database details, or credentials.
        return response(ApiError.of(500, "INTERNAL_ERROR", "An unexpected error occurred."));
    }

    private ResponseEntity<ApiError> response(ApiError error) {
        return ResponseEntity.status(error.status()).cacheControl(CacheControl.noStore()).body(error);
    }
}
