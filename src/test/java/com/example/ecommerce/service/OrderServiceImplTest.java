package com.example.ecommerce.service;

import com.example.ecommerce.dto.order.OrderResponse;
import com.example.ecommerce.entity.Cart;
import com.example.ecommerce.entity.CartItem;
import com.example.ecommerce.entity.Product;
import com.example.ecommerce.entity.User;
import com.example.ecommerce.entity.enums.Role;
import com.example.ecommerce.exception.BadRequestException;
import com.example.ecommerce.exception.InsufficientStockException;
import com.example.ecommerce.repository.OrderRepository;
import com.example.ecommerce.repository.UserRepository;
import com.example.ecommerce.service.impl.OrderServiceImpl;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class OrderServiceImplTest {

    @Mock
    private OrderRepository orderRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private CartService cartService;
    @Mock
    private ProductService productService;

    @InjectMocks
    private OrderServiceImpl orderService;

    @Test
    void createOrderFromCart_shouldThrow_whenCartIsEmpty() {
        User user = User.builder().id(1L).email("a@a.com").role(Role.USER).build();
        Cart cart = Cart.builder().id(1L).user(user).items(new ArrayList<>()).build();

        when(userRepository.findByEmail("a@a.com")).thenReturn(Optional.of(user));
        when(cartService.getOrCreateCartEntity("a@a.com")).thenReturn(cart);

        assertThatThrownBy(() -> orderService.createOrderFromCart("a@a.com"))
                .isInstanceOf(BadRequestException.class);
    }

    @Test
    void createOrderFromCart_shouldThrow_whenStockInsufficient() {
        User user = User.builder().id(1L).email("a@a.com").role(Role.USER).build();
        Product product = Product.builder().id(10L).name("Phone").price(BigDecimal.valueOf(100)).quantity(1).build();
        CartItem cartItem = CartItem.builder().id(5L).product(product).quantity(5).build();
        Cart cart = Cart.builder().id(1L).user(user).items(new ArrayList<>(List.of(cartItem))).build();

        when(userRepository.findByEmail("a@a.com")).thenReturn(Optional.of(user));
        when(cartService.getOrCreateCartEntity("a@a.com")).thenReturn(cart);
        doThrow(new InsufficientStockException("Not enough stock"))
                .when(productService).checkAvailability(10L, 5);

        assertThatThrownBy(() -> orderService.createOrderFromCart("a@a.com"))
                .isInstanceOf(InsufficientStockException.class);
    }

    @Test
    void createOrderFromCart_shouldSucceed_whenStockIsSufficient() {
        User user = User.builder().id(1L).email("a@a.com").role(Role.USER).build();
        Product product = Product.builder().id(10L).name("Phone").price(BigDecimal.valueOf(100)).quantity(5).build();
        CartItem cartItem = CartItem.builder().id(5L).product(product).quantity(2).build();
        Cart cart = Cart.builder().id(1L).user(user).items(new ArrayList<>(List.of(cartItem))).build();

        when(userRepository.findByEmail("a@a.com")).thenReturn(Optional.of(user));
        when(cartService.getOrCreateCartEntity("a@a.com")).thenReturn(cart);
        when(orderRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        OrderResponse response = orderService.createOrderFromCart("a@a.com");

        assertThat(response.totalAmount()).isEqualByComparingTo(BigDecimal.valueOf(200));
        assertThat(response.items()).hasSize(1);
        verify(productService).decreaseStock(10L, 2);
        assertThat(cart.getItems()).isEmpty();
    }
}
