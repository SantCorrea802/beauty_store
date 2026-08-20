package com.gabriela.store.cart;

import com.gabriela.store.cart.dto.AddCartItemRequest;
import com.gabriela.store.cart.dto.CartResponse;
import com.gabriela.store.cart.dto.UpdateCartItemQuantityRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/me/cart")
public class CustomerCartController {

    private final CustomerCartService customerCartService;

    public CustomerCartController(CustomerCartService customerCartService) {
        this.customerCartService = customerCartService;
    }

    @GetMapping
    public CartResponse getMyCart() {
        return customerCartService.getMyCart();
    }

    @PostMapping("/items")
    public CartResponse addItem(@Valid @RequestBody AddCartItemRequest request) {
        return customerCartService.addItem(request);
    }

    @PatchMapping("/items/{itemId}")
    public CartResponse updateItemQuantity(
            @PathVariable Long itemId,
            @Valid @RequestBody UpdateCartItemQuantityRequest request
    ) {
        return customerCartService.updateItemQuantity(itemId, request);
    }

    @DeleteMapping("/items/{itemId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void removeItem(@PathVariable Long itemId) {
        customerCartService.removeItem(itemId);
    }

    @DeleteMapping
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void clearCart() {
        customerCartService.clearCart();
    }
}