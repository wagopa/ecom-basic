package com.example.ecommerce.repository;

import com.example.ecommerce.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Long> {

    Optional<Product> findByIdAndDeletedAtIsNull(Long id);

    @Query("""
            SELECT p FROM Product p
            WHERE p.deletedAt IS NULL
              AND (:categoryId IS NULL OR p.category.id = :categoryId)
              AND (:keyword IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%')))
            """)
    Page<Product> search(@Param("categoryId") Long categoryId,
                          @Param("keyword") String keyword,
                          Pageable pageable);
}
