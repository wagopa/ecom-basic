package com.example.ecommerce.controller;

import com.example.ecommerce.common.PageResponse;
import com.example.ecommerce.dto.order.OrderResponse;
import com.example.ecommerce.dto.order.OrderStatusUpdateRequest;
import com.example.ecommerce.entity.enums.OrderStatus;
import com.example.ecommerce.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    public ResponseEntity<OrderResponse> create(Authentication authentication) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(orderService.createOrderFromCart(authentication.getName()));
    }

    @GetMapping
    public ResponseEntity<PageResponse<OrderResponse>> getOrders(
            Authentication authentication,
            @RequestParam(required = false) OrderStatus status,
            Pageable pageable) {
        boolean isAdmin = isAdmin(authentication);
        return ResponseEntity.ok(orderService.getOrders(authentication.getName(), isAdmin, status, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrderResponse> getById(Authentication authentication, @PathVariable Long id) {
        boolean isAdmin = isAdmin(authentication);
        return ResponseEntity.ok(orderService.getOrderById(authentication.getName(), isAdmin, id));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<OrderResponse> updateStatus(@PathVariable Long id,
                                                        @Valid @RequestBody OrderStatusUpdateRequest request) {
        return ResponseEntity.ok(orderService.updateStatus(id, request));
    }

    @org.springframework.web.bind.annotation.DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id, Authentication authentication) {
        if (!isAdmin(authentication)) {
            throw new org.springframework.security.access.AccessDeniedException("Only admins can delete orders");
        }
        orderService.deleteOrder(id);
        return ResponseEntity.noContent().build();
    }

    private boolean isAdmin(Authentication authentication) {
        return authentication.getAuthorities().stream()
                .map(a -> a.getAuthority())
                .collect(Collectors.toSet())
                .contains("ROLE_ADMIN");
    }
}
