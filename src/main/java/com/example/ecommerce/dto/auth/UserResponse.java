package com.example.ecommerce.dto.auth;

import com.example.ecommerce.entity.enums.Role;

public record UserResponse(
        Long id,
        String email,
        String fullName,
        Role role
) {
}
