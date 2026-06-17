package com.example.ecommerce.service;

import com.example.ecommerce.common.PageResponse;
import com.example.ecommerce.dto.product.ProductRequest;
import com.example.ecommerce.dto.product.ProductResponse;
import com.example.ecommerce.entity.Product;
import org.springframework.data.domain.Pageable;

public interface ProductService {
    PageResponse<ProductResponse> search(Long categoryId, String keyword, Pageable pageable);
    ProductResponse getById(Long id);
    ProductResponse create(ProductRequest request);
    ProductResponse update(Long id, ProductRequest request);
    void delete(Long id);

    // Internal helpers reused by CartService / OrderService
    Product getActiveProductEntity(Long id);
    void checkAvailability(Long productId, int requestedQuantity);
    void decreaseStock(Long productId, int quantity);
}
