package com.example.ecommerce.service;

import com.example.ecommerce.dto.cart.CartItemRequest;
import com.example.ecommerce.dto.cart.CartResponse;
import com.example.ecommerce.dto.cart.UpdateCartItemRequest;
import com.example.ecommerce.entity.Cart;

public interface CartService {
    CartResponse getCurrentUserCart(String email);
    CartResponse addItem(String email, CartItemRequest request);
    CartResponse updateItem(String email, Long itemId, UpdateCartItemRequest request);
    void removeItem(String email, Long itemId);

    // Used internally by OrderService
    Cart getOrCreateCartEntity(String email);
}
