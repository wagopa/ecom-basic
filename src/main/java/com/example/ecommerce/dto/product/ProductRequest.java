package com.example.ecommerce.dto.product;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record ProductRequest(
        @NotBlank(message = "Name must not be blank")
        @Size(max = 255, message = "Name must not exceed 255 characters")
        String name,

        @Size(max = 2000, message = "Description must not exceed 2000 characters")
        String description,

        @NotNull(message = "Price must not be null")
        @DecimalMin(value = "0.0", inclusive = false, message = "Price must be greater than 0")
        BigDecimal price,

        @NotNull(message = "Quantity must not be null")
        @Min(value = 0, message = "Quantity must not be negative")
        Integer quantity,

        @Size(max = 500, message = "Image URL must not exceed 500 characters")
        @Pattern(regexp = "^(https?://).+", message = "Image URL must start with http:// or https://")
        String imageUrl,

        @NotNull(message = "Category id must not be null")
        Long categoryId
) {
}
