package com.pantrypal.backend.common.exception;

public class InvalidRefreshTokenException extends RuntimeException {
    public InvalidRefreshTokenException() { super("Invalid or expired refresh token"); }
}
