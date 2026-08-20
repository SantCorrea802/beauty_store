package com.gabriela.store.favorite;

import com.gabriela.store.common.exception.NotFoundException;
import com.gabriela.store.customer.Cliente;
import com.gabriela.store.customer.CurrentCustomerService;
import com.gabriela.store.favorite.dto.FavoriteProductResponse;
import com.gabriela.store.image.ImagenProducto;
import com.gabriela.store.image.ImagenProductoRepository;
import com.gabriela.store.product.Producto;
import com.gabriela.store.product.ProductoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CustomerFavoriteService {

    private final CurrentCustomerService currentCustomerService;
    private final ProductoRepository productoRepository;
    private final ClienteFavoritoRepository clienteFavoritoRepository;
    private final ImagenProductoRepository imagenProductoRepository;

    public CustomerFavoriteService(
            CurrentCustomerService currentCustomerService,
            ProductoRepository productoRepository,
            ClienteFavoritoRepository clienteFavoritoRepository,
            ImagenProductoRepository imagenProductoRepository
    ) {
        this.currentCustomerService = currentCustomerService;
        this.productoRepository = productoRepository;
        this.clienteFavoritoRepository = clienteFavoritoRepository;
        this.imagenProductoRepository = imagenProductoRepository;
    }

    @Transactional(readOnly = true)
    public List<FavoriteProductResponse> findMyFavorites() {
        Cliente cliente = currentCustomerService.getCurrentCustomer();

        return clienteFavoritoRepository.findActiveFavoritesByClienteId(cliente.getIdCliente())
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public FavoriteProductResponse addFavorite(Long productId) {
        Cliente cliente = currentCustomerService.getCurrentCustomer();

        Producto producto = productoRepository.findById(productId)
                .filter(Producto::isActivo)
                .orElseThrow(() -> new NotFoundException("Producto no encontrado o no disponible: " + productId));

        return clienteFavoritoRepository
                .findByCliente_IdClienteAndProducto_IdProducto(cliente.getIdCliente(), producto.getIdProducto())
                .map(this::toResponse)
                .orElseGet(() -> {
                    ClienteFavorito favorite = new ClienteFavorito(cliente, producto);
                    ClienteFavorito savedFavorite = clienteFavoritoRepository.save(favorite);
                    return toResponse(savedFavorite);
                });
    }

    @Transactional
    public void removeFavorite(Long productId) {
        Cliente cliente = currentCustomerService.getCurrentCustomer();

        ClienteFavorito favorite = clienteFavoritoRepository
                .findByCliente_IdClienteAndProducto_IdProducto(cliente.getIdCliente(), productId)
                .orElseThrow(() -> new NotFoundException("Favorito no encontrado para el producto: " + productId));

        clienteFavoritoRepository.delete(favorite);
    }

    private FavoriteProductResponse toResponse(ClienteFavorito favorite) {
        Producto producto = favorite.getProducto();

        String imagenPrincipalUrl = imagenProductoRepository
                .findByProducto_IdProductoAndPrincipalTrue(producto.getIdProducto())
                .map(ImagenProducto::getUrl)
                .orElse(null);

        return new FavoriteProductResponse(
                favorite.getIdClienteFavorito(),
                producto.getIdProducto(),
                producto.getNombreProducto(),
                producto.getPrecio(),
                producto.getDescripcion(),
                producto.getSlug(),
                producto.isActivo(),
                producto.getMarca(),
                imagenPrincipalUrl,
                favorite.getFechaCreacion()
        );
    }
}