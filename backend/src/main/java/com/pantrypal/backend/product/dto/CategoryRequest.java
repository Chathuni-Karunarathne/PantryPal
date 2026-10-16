package com.pantrypal.backend.product.dto;

import jakarta.validation.constraints.*;

public record CategoryRequest(@NotBlank @Size(max = 120) String name) {}
