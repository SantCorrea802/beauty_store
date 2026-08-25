package com.gabriela.store.cart;

import com.gabriela.store.cart.dto.AddCartItemRequest;
import com.gabriela.store.cart.dto.CartItemResponse;
import com.gabriela.store.cart.dto.CartResponse;
import com.gabriela.store.cart.dto.UpdateCartItemQuantityRequest;
import com.gabriela.store.common.exception.BadRequestException;
import com.gabriela.store.common.exception.NotFoundException;
import com.gabriela.store.customer.Cliente;
import com.gabriela.store.customer.CurrentCustomerService;
import com.gabriela.store.image.ImagenProducto;
import com.gabriela.store.image.ImagenProductoRepository;
import com.gabriela.store.product.Producto;
import com.gabriela.store.product.ProductoRepository;
import com.gabriela.store.product.ProductoVariante;
import com.gabriela.store.product.ProductoVarianteRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Service
public class CustomerCartService {

    private final CurrentCustomerService currentCustomerService;
    private final CarritoRepository carritoRepository;
    private final CarritoItemRepository carritoItemRepository;
    private final ProductoRepository productoRepository;
    private final ProductoVarianteRepository productoVarianteRepository;
    private final ImagenProductoRepository imagenProductoRepository;

    public CustomerCartService(
            CurrentCustomerService currentCustomerService,
            CarritoRepository carritoRepository,
            CarritoItemRepository carritoItemRepository,
            ProductoRepository productoRepository,
            ProductoVarianteRepository productoVarianteRepository,
            ImagenProductoRepository imagenProductoRepository
    ) {
        this.currentCustomerService = currentCustomerService;
        this.carritoRepository = carritoRepository;
        this.carritoItemRepository = carritoItemRepository;
        this.productoRepository = productoRepository;
        this.productoVarianteRepository = productoVarianteRepository;
        this.imagenProductoRepository = imagenProductoRepository;
    }

    @Transactional(readOnly = true)
    public CartResponse getMyCart() {
        Cliente cliente = currentCustomerService.getCurrentCustomer();

        Carrito carrito = carritoRepository
                .findByCliente_IdClienteAndEstado(cliente.getIdCliente(), CarritoEstado.ACTIVO)
                .orElse(null);

        if (carrito == null) {
            return emptyCartResponse();
        }

        return toResponse(carrito);
    }

    @Transactional
    public CartResponse addItem(AddCartItemRequest request) {
        Cliente cliente = currentCustomerService.getCurrentCustomer();

        Producto producto = productoRepository.findById(request.productId())
                .filter(Producto::isActivo)
                .orElseThrow(() -> new NotFoundException(
                        "Producto no encontrado o no disponible: " + request.productId()
                ));

        ProductoVariante variante = resolveVariant(producto, request.variantId());

        Carrito carrito = getOrCreateActiveCart(cliente);

        Optional<CarritoItem> existingItem = variante == null
                ? carritoItemRepository.findByCarrito_IdCarritoAndProducto_IdProductoAndVarianteIsNull(
                carrito.getIdCarrito(),
                producto.getIdProducto()
        )
                : carritoItemRepository.findByCarrito_IdCarritoAndProducto_IdProductoAndVariante_IdVariante(
                carrito.getIdCarrito(),
                producto.getIdProducto(),
                variante.getIdVariante()
        );

        existingItem.ifPresentOrElse(
                item -> item.aumentarCantidad(request.quantity()),
                () -> {
                    CarritoItem item = new CarritoItem(
                            carrito,
                            producto,
                            variante,
                            request.quantity(),
                            producto.getPrecio()
                    );

                    carritoItemRepository.save(item);
                }
        );

        return toResponse(carrito);
    }

    @Transactional
    public CartResponse updateItemQuantity(Long itemId, UpdateCartItemQuantityRequest request) {
        Cliente cliente = currentCustomerService.getCurrentCustomer();
        Carrito carrito = getExistingActiveCart(cliente);

        CarritoItem item = carritoItemRepository
                .findByIdCarritoItemAndCarrito_IdCarrito(itemId, carrito.getIdCarrito())
                .orElseThrow(() -> new NotFoundException("Item de carrito no encontrado: " + itemId));

        item.actualizarCantidad(request.quantity());

        return toResponse(carrito);
    }

    @Transactional
    public void removeItem(Long itemId) {
        Cliente cliente = currentCustomerService.getCurrentCustomer();
        Carrito carrito = getExistingActiveCart(cliente);

        CarritoItem item = carritoItemRepository
                .findByIdCarritoItemAndCarrito_IdCarrito(itemId, carrito.getIdCarrito())
                .orElseThrow(() -> new NotFoundException("Item de carrito no encontrado: " + itemId));

        carritoItemRepository.delete(item);
    }

    @Transactional
    public void clearCart() {
        Cliente cliente = currentCustomerService.getCurrentCustomer();
        Carrito carrito = getExistingActiveCart(cliente);

        carritoItemRepository.deleteByCarrito_IdCarrito(carrito.getIdCarrito());
    }

    private ProductoVariante resolveVariant(Producto producto, Long variantId) {
        boolean productHasActiveVariants = productoVarianteRepository
                .existsByProducto_IdProductoAndActivoTrue(producto.getIdProducto());

        if (!productHasActiveVariants && variantId == null) {
            return null;
        }

        if (productHasActiveVariants && variantId == null) {
            throw new BadRequestException("Selecciona un tono para este producto.");
        }

        if (!productHasActiveVariants) {
            throw new BadRequestException("Este producto no tiene tonos seleccionables.");
        }

        return productoVarianteRepository.findById(variantId)
                .filter(ProductoVariante::isActivo)
                .filter(variante -> variante.getProducto().getIdProducto().equals(producto.getIdProducto()))
                .orElseThrow(() -> new BadRequestException(
                        "El tono seleccionado no pertenece al producto o no está disponible."
                ));
    }

    private Carrito getOrCreateActiveCart(Cliente cliente) {
        return carritoRepository
                .findByCliente_IdClienteAndEstado(cliente.getIdCliente(), CarritoEstado.ACTIVO)
                .orElseGet(() -> carritoRepository.save(new Carrito(cliente)));
    }

    private Carrito getExistingActiveCart(Cliente cliente) {
        return carritoRepository
                .findByCliente_IdClienteAndEstado(cliente.getIdCliente(), CarritoEstado.ACTIVO)
                .orElseThrow(() -> new NotFoundException("El cliente no tiene un carrito activo."));
    }

    private CartResponse toResponse(Carrito carrito) {
        List<CartItemResponse> items = carritoItemRepository
                .findByCarrito_IdCarritoOrderByIdCarritoItemAsc(carrito.getIdCarrito())
                .stream()
                .map(this::toItemResponse)
                .toList();

        BigDecimal total = items.stream()
                .map(CartItemResponse::subtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        int totalItems = items.stream()
                .mapToInt(CartItemResponse::quantity)
                .sum();

        return new CartResponse(
                carrito.getIdCarrito(),
                carrito.getEstado().name(),
                items,
                totalItems,
                total,
                carrito.getFechaUltimaActualizacion()
        );
    }

    private CartItemResponse toItemResponse(CarritoItem item) {
        Producto producto = item.getProducto();
        ProductoVariante variante = item.getVariante();

        String imagenPrincipalUrl = imagenProductoRepository
                .findByProducto_IdProductoAndPrincipalTrue(producto.getIdProducto())
                .map(ImagenProducto::getUrl)
                .orElse(null);

        return new CartItemResponse(
                item.getIdCarritoItem(),
                producto.getIdProducto(),
                variante != null ? variante.getIdVariante() : null,
                variante != null ? variante.getNombre() : null,
                variante != null ? variante.getColorHex() : null,
                producto.getNombreProducto(),
                producto.getSlug(),
                producto.getMarca(),
                imagenPrincipalUrl,
                item.getPrecioUnitarioSnapshot(),
                item.getCantidad(),
                item.calcularSubtotal()
        );
    }

    private CartResponse emptyCartResponse() {
        return new CartResponse(
                null,
                CarritoEstado.ACTIVO.name(),
                List.of(),
                0,
                BigDecimal.ZERO,
                null
        );
    }
}