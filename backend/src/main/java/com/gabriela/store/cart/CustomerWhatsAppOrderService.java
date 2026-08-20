package com.gabriela.store.cart;

import com.gabriela.store.cart.dto.WhatsAppOrderResponse;
import com.gabriela.store.common.exception.BadRequestException;
import com.gabriela.store.customer.Cliente;
import com.gabriela.store.customer.CurrentCustomerService;
import com.gabriela.store.product.Producto;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.NumberFormat;
import java.util.List;
import java.util.Locale;

@Service
public class CustomerWhatsAppOrderService {

    private static final Locale COLOMBIA_LOCALE = Locale.forLanguageTag("es-CO");

    private final CurrentCustomerService currentCustomerService;
    private final CarritoRepository carritoRepository;
    private final CarritoItemRepository carritoItemRepository;
    private final String businessWhatsAppNumber;

    public CustomerWhatsAppOrderService(
            CurrentCustomerService currentCustomerService,
            CarritoRepository carritoRepository,
            CarritoItemRepository carritoItemRepository,
            @Value("${app.business.whatsapp-number}") String businessWhatsAppNumber
    ) {
        this.currentCustomerService = currentCustomerService;
        this.carritoRepository = carritoRepository;
        this.carritoItemRepository = carritoItemRepository;
        this.businessWhatsAppNumber = businessWhatsAppNumber;
    }

    @Transactional(readOnly = true)
    public WhatsAppOrderResponse generateWhatsAppOrder() {
        Cliente cliente = currentCustomerService.getCurrentCustomer();

        Carrito carrito = carritoRepository
                .findByCliente_IdClienteAndEstado(cliente.getIdCliente(), CarritoEstado.ACTIVO)
                .orElseThrow(() -> new BadRequestException("El carrito está vacío."));

        List<CarritoItem> items = carritoItemRepository
                .findByCarrito_IdCarritoOrderByIdCarritoItemAsc(carrito.getIdCarrito());

        if (items.isEmpty()) {
            throw new BadRequestException("El carrito está vacío.");
        }

        validateProductsAreAvailable(items);

        String normalizedPhone = normalizeBusinessWhatsAppNumber(businessWhatsAppNumber);
        BigDecimal total = calculateTotal(items);
        int totalItems = calculateTotalItems(items);

        String message = buildMessage(cliente, items, total);
        String whatsappUrl = buildWhatsAppUrl(normalizedPhone, message);

        return new WhatsAppOrderResponse(
                message,
                whatsappUrl,
                totalItems,
                total
        );
    }

    private void validateProductsAreAvailable(List<CarritoItem> items) {
        List<String> unavailableProducts = items.stream()
                .map(CarritoItem::getProducto)
                .filter(producto -> !producto.isActivo())
                .map(Producto::getNombreProducto)
                .toList();

        if (!unavailableProducts.isEmpty()) {
            throw new BadRequestException(
                    "El carrito contiene productos no disponibles: " + String.join(", ", unavailableProducts)
            );
        }
    }

    private BigDecimal calculateTotal(List<CarritoItem> items) {
        return items.stream()
                .map(CarritoItem::calcularSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private int calculateTotalItems(List<CarritoItem> items) {
        return items.stream()
                .mapToInt(CarritoItem::getCantidad)
                .sum();
    }

    private String buildMessage(Cliente cliente, List<CarritoItem> items, BigDecimal total) {
        NumberFormat currencyFormat = NumberFormat.getCurrencyInstance(COLOMBIA_LOCALE);

        StringBuilder message = new StringBuilder();

        message.append("Hola, quiero hacer este pedido:\n\n");

        message.append("Datos del cliente:\n");
        message.append("Nombre: ").append(cliente.getNombre()).append("\n");
        message.append("Teléfono: ").append(cliente.getTelefono()).append("\n");
        message.append("Correo: ").append(cliente.getEmail()).append("\n\n");

        message.append("Productos:\n");

        for (int i = 0; i < items.size(); i++) {
            CarritoItem item = items.get(i);
            Producto producto = item.getProducto();

            message.append(i + 1).append(". ").append(producto.getNombreProducto()).append("\n");
            message.append("   Cantidad: ").append(item.getCantidad()).append("\n");
            message.append("   Precio unitario: ")
                    .append(currencyFormat.format(item.getPrecioUnitarioSnapshot()))
                    .append("\n");
            message.append("   Subtotal: ")
                    .append(currencyFormat.format(item.calcularSubtotal()))
                    .append("\n\n");
        }

        message.append("Total estimado: ")
                .append(currencyFormat.format(total))
                .append("\n\n");

        message.append("Quedo atento/a para confirmar disponibilidad, forma de entrega y pago.");

        return message.toString();
    }

    private String buildWhatsAppUrl(String phoneNumber, String message) {
        String encodedMessage = URLEncoder
                .encode(message, StandardCharsets.UTF_8)
                .replace("+", "%20");

        return "https://wa.me/" + phoneNumber + "?text=" + encodedMessage;
    }

    private String normalizeBusinessWhatsAppNumber(String rawPhoneNumber) {
        if (rawPhoneNumber == null || rawPhoneNumber.isBlank()) {
            throw new BadRequestException("No está configurado el número de WhatsApp del negocio.");
        }

        String normalized = rawPhoneNumber.replaceAll("[^0-9]", "");

        if (normalized.length() < 10 || normalized.length() > 15) {
            throw new BadRequestException(
                    "El número de WhatsApp del negocio debe estar en formato internacional, solo dígitos."
            );
        }

        return normalized;
    }
}