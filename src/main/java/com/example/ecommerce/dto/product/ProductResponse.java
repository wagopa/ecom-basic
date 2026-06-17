package com.example.ecommerce.dto.product;

import com.example.ecommerce.dto.category.CategoryResponse;

import java.math.BigDecimal;

public record ProductResponse(
        Long id,
        String name,
        String description,
        BigDecimal price,
        Integer quantity,
        String imageUrl,
        CategoryResponse category
) {
}
