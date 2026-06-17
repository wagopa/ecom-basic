package com.example.ecommerce.dto.order;

import com.example.ecommerce.entity.enums.OrderStatus;
import jakarta.validation.constraints.NotNull;

public record OrderStatusUpdateRequest(
        @NotNull(message = "Status must not be null")
        OrderStatus status
) {
}
