package com.example.ecommerce.service;

import com.example.ecommerce.common.PageResponse;
import com.example.ecommerce.dto.order.OrderResponse;
import com.example.ecommerce.dto.order.OrderStatusUpdateRequest;
import com.example.ecommerce.entity.enums.OrderStatus;
import org.springframework.data.domain.Pageable;

public interface OrderService {
    OrderResponse createOrderFromCart(String email);
    PageResponse<OrderResponse> getOrders(String email, boolean isAdmin, OrderStatus status, Pageable pageable);
    OrderResponse getOrderById(String email, boolean isAdmin, Long orderId);
    OrderResponse updateStatus(Long orderId, OrderStatusUpdateRequest request);
    void deleteOrder(Long orderId);
}
