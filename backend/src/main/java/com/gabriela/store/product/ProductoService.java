package com.gabriela.store.product;

import com.gabriela.store.audit.AuditAction;
import com.gabriela.store.audit.ProductoAuditLog;
import com.gabriela.store.audit.ProductoAuditLogRepository;
import com.gabriela.store.category.Categoria;
import com.gabriela.store.category.CategoriaRepository;
import com.gabriela.store.category.dto.CategoryResponse;
import com.gabriela.store.common.exception.BadRequestException;
import com.gabriela.store.common.exception.NotFoundException;
import com.gabriela.store.common.text.SlugUtils;
import com.gabriela.store.product.dto.ProductCreateRequest;
import com.gabriela.store.product.dto.ProductDetailResponse;
import com.gabriela.store.product.dto.ProductResponse;
import com.gabriela.store.user.UsuarioAdmin;
import com.gabriela.store.user.UsuarioAdminRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;

@Service
public class ProductoService {

    private final ProductoRepository productoRepository;
    private final CategoriaRepository categoriaRepository;
    private final ProductoCategoriaRepository productoCategoriaRepository;
    private final ProductoAuditLogRepository productoAuditLogRepository;
    private final UsuarioAdminRepository usuarioAdminRepository;

    public ProductoService(
            ProductoRepository productoRepository,
            CategoriaRepository categoriaRepository,
            ProductoCategoriaRepository productoCategoriaRepository,
            ProductoAuditLogRepository productoAuditLogRepository,
            UsuarioAdminRepository usuarioAdminRepository
    ) {
        this.productoRepository = productoRepository;
        this.categoriaRepository = categoriaRepository;
        this.productoCategoriaRepository = productoCategoriaRepository;
        this.productoAuditLogRepository = productoAuditLogRepository;
        this.usuarioAdminRepository = usuarioAdminRepository;
    }
    // el siguiente metodo devuelve los productos activos
    @Transactional(readOnly = true)
    public List<ProductResponse> findAllActive() {
        return productoRepository.findByActivoTrue()
                .stream()
                .map(this::toSummaryResponse)
                .toList();
    }

    //el siguiente metodo devuelve los productos activos por categoria, recibe el slug de la categoria como parametro
    @Transactional(readOnly = true)
    public List<ProductResponse> findAllActiveByCategory(String categorySlug) {
        return productoRepository.findActiveByCategorySlug(categorySlug)
                .stream()
                .map(this::toSummaryResponse)
                .toList();
    }


    // este metodo devuelve un producto por su slug, si el producto no existe o no esta activo, lanza una excepcion
    @Transactional(readOnly = true)
    public ProductDetailResponse findBySlug(String slug) {
        Producto producto = productoRepository.findBySlugWithCategories(slug)
                .filter(Producto::isActivo)
                .orElseThrow(() -> new NotFoundException("Producto no encontrado: " + slug));

        return toDetailResponse(producto);
    }


    // el siguiente metodo crea un nuevo producto, recibe un objeto ProductCreateRequest
    // con los datos del producto a crear, valida que las categorias existan y que no haya
    // categorias duplicadas, genera un slug unico, guarda el producto y las relaciones
    // con las categorias, y finalmente devuelve el producto creado en formato de respuesta detallada
    @Transactional
    public ProductDetailResponse create(ProductCreateRequest request) {
        validateUniqueCategoryIds(request.categoriaIds());

        List<Categoria> categorias = categoriaRepository.findAllById(request.categoriaIds());

        if (categorias.size() != request.categoriaIds().size()) {
            throw new BadRequestException("Una o más categorías no existen.");
        }

        String slug = generateUniqueSlug(request.name());

        // Temporal: mientras no exista autenticación real, usamos el primer admin.
        UsuarioAdmin admin = usuarioAdminRepository.findAll()
                .stream()
                .findFirst()
                .orElseThrow(() -> new BadRequestException("No existe un usuario admin para asociar la creación del producto."));

        Producto producto = new Producto(
                request.name().trim(),
                request.price(),
                normalizeNullableText(request.description()),
                slug,
                normalizeNullableText(request.marca()),
                admin
        );

        Producto savedProduct = productoRepository.save(producto);

        List<ProductoCategoria> relaciones = categorias.stream()
                .map(categoria -> new ProductoCategoria(savedProduct, categoria))
                .toList();

        productoCategoriaRepository.saveAll(relaciones);

        productoAuditLogRepository.save(new ProductoAuditLog(
                savedProduct,
                admin,
                AuditAction.CREATED,
                "Producto creado desde API admin."
        ));

        Producto productWithCategories = productoRepository.findBySlugWithCategories(savedProduct.getSlug())
                .orElseThrow(() -> new NotFoundException("Producto creado pero no pudo recuperarse: " + savedProduct.getSlug()));

        return toDetailResponse(productWithCategories);
    }



    // el siguiente metodo valida que la lista de categorias no sea nula ni vacia, y que no
    // contenga ids duplicados, si alguna de estas condiciones no se cumple, lanza una excepcion
    private void validateUniqueCategoryIds(List<Long> categoriaIds) {
        if (categoriaIds == null || categoriaIds.isEmpty()) {
            throw new BadRequestException("El producto debe tener al menos una categoría.");
        }

        if (new HashSet<>(categoriaIds).size() != categoriaIds.size()) {
            throw new BadRequestException("La lista de categorías contiene IDs duplicados.");
        }
    }


    // aqui se genera un slug unico a partir del nombre del producto, si el slug generado
    // ya existe en la base de datos, se le agrega un sufijo numerico hasta encontrar
    // uno que no exista, y se devuelve el slug unico generado, esto garantiza que no haya
    // conflictos de slugs entre productos, incluso si tienen nombres similares o iguales
    private String generateUniqueSlug(String nombre) {
        String baseSlug = SlugUtils.toSlug(nombre);

        String candidate = baseSlug;
        int suffix = 2;

        while (productoRepository.existsBySlug(candidate)) {
            candidate = baseSlug + "-" + suffix;
            suffix++;
        }

        return candidate;
    }

    //el siguiente metodo normaliza un texto que puede ser nulo, si el valor es nulo o
    // esta en blanco, devuelve null, de lo contrario devuelve el texto recortado, esto
    // se utiliza para campos opcionales como descripcion o marca, para evitar almacenar
    // cadenas vacias o con espacios en blanco, y en su lugar almacenar null en la base
    // de datos, lo que facilita las consultas y el manejo de datos nulos

    private String normalizeNullableText(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }






    // aqui se convierten los productos a un formato de respuesta mas simple, sin las categorias asociadas, para ser utilizado en la lista de productos
    private ProductResponse toSummaryResponse(Producto producto) {
        return new ProductResponse(
                producto.getIdProducto(),
                producto.getNombreProducto(),
                producto.getPrecio(),
                producto.getDescripcion(),
                producto.getSlug(),
                producto.isActivo(),
                producto.getMarca()
        );
    }


    // este metodo convierte un producto a un formato de respuesta mas detallado, incluyendo las categorias asociadas, para ser utilizado en la vista de detalle del producto
    private ProductDetailResponse toDetailResponse(Producto producto) {
        List<CategoryResponse> categorias = producto.getCategorias()
                .stream()
                .map(ProductoCategoria::getCategoria)
                .map(categoria -> new CategoryResponse(
                        categoria.getIdCategoria(),
                        categoria.getNombre(),
                        categoria.getSlug()
                ))
                .toList();


        return new ProductDetailResponse(
                producto.getIdProducto(),
                producto.getNombreProducto(),
                producto.getPrecio(),
                producto.getDescripcion(),
                producto.getSlug(),
                producto.isActivo(),
                producto.getMarca(),
                categorias
        );
    }
}