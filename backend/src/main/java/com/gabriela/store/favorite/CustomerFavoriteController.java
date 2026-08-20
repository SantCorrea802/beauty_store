package com.gabriela.store.favorite;

import com.gabriela.store.favorite.dto.FavoriteProductResponse;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/me/favorites")
public class CustomerFavoriteController {

    private final CustomerFavoriteService customerFavoriteService;

    public CustomerFavoriteController(CustomerFavoriteService customerFavoriteService) {
        this.customerFavoriteService = customerFavoriteService;
    }

    @GetMapping
    public List<FavoriteProductResponse> findMyFavorites() {
        return customerFavoriteService.findMyFavorites();
    }

    @PostMapping("/{productId}")
    public FavoriteProductResponse addFavorite(@PathVariable Long productId) {
        return customerFavoriteService.addFavorite(productId);
    }

    @DeleteMapping("/{productId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void removeFavorite(@PathVariable Long productId) {
        customerFavoriteService.removeFavorite(productId);
    }
}