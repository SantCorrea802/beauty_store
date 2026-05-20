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
import com.gabriela.store.product.dto.ProductUpdateRequest;
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

        String slug = generateUniqueSlug(request.nombre());

        // Temporal: mientras no exista autenticación real, usamos el primer admin.
        UsuarioAdmin admin = usuarioAdminRepository.findAll()
                .stream()
                .findFirst()
                .orElseThrow(() -> new BadRequestException("No existe un usuario admin para asociar la creación del producto."));

        Producto producto = new Producto(
                request.nombre().trim(),
                request.precio(),
                normalizeNullableText(request.descripcion()),
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

        List<ProductoCategoria> savedRelations =
                productoCategoriaRepository.findByProducto_IdProducto(savedProduct.getIdProducto());

        return toDetailResponse(savedProduct, savedRelations);
    }


    private ProductDetailResponse toDetailResponse(Producto producto) {
        return toDetailResponse(producto, producto.getCategorias());
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
    private ProductDetailResponse toDetailResponse(Producto producto, List<ProductoCategoria> relaciones) {
        List<CategoryResponse> categorias = relaciones
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


    // este metodo actualiza un producto existente, recibe el id del producto a actualizar
    // y un objeto ProductUpdateRequest con los nuevos datos del producto, valida que el
    // producto exista, que las categorias existan y no haya categorias duplicadas, genera
    // un slug unico para la actualizacion, actualiza los datos del producto, guarda el producto
    // y las nuevas relaciones con las categorias, y finalmente devuelve el producto actualizado
    // en formato de respuesta detallada, ademas registra la actualizacion en el log de
    // auditoria con el usuario admin que realizo la actualizacion, y una descripcion
    // de la accion realizada
    @Transactional
    public ProductDetailResponse update(Long idProducto, ProductUpdateRequest request) {
        validateUniqueCategoryIds(request.categoriaIds());

        Producto producto = productoRepository.findById(idProducto)
                .orElseThrow(() -> new NotFoundException("Producto no encontrado con id: " + idProducto));

        List<Categoria> categorias = categoriaRepository.findAllById(request.categoriaIds());

        if (categorias.size() != request.categoriaIds().size()) {
            throw new BadRequestException("Una o más categorías no existen.");
        }

        UsuarioAdmin admin = usuarioAdminRepository.findAll()
                .stream()
                .findFirst()
                .orElseThrow(() -> new BadRequestException("No existe un usuario admin para asociar la edición del producto."));

        String slug = generateUniqueSlugForUpdate(request.nombre(), producto.getIdProducto());

        producto.actualizarDatos(
                request.nombre().trim(),
                request.precio(),
                normalizeNullableText(request.descripcion()),
                normalizeNullableText(request.marca()),
                slug,
                admin
        );


        Producto savedProduct = productoRepository.save(producto);

        productoCategoriaRepository.deleteAllByProductoId(savedProduct.getIdProducto());
        productoCategoriaRepository.flush();

        List<ProductoCategoria> nuevasRelaciones = categorias.stream()
                .map(categoria -> new ProductoCategoria(savedProduct, categoria))
                .toList();

        productoCategoriaRepository.saveAll(nuevasRelaciones);

        productoAuditLogRepository.save(new ProductoAuditLog(
                savedProduct,
                admin,
                AuditAction.UPDATED,
                "Producto actualizado desde API admin."
        ));

        List<ProductoCategoria> savedRelations =
                productoCategoriaRepository.findByProducto_IdProducto(savedProduct.getIdProducto());

        return toDetailResponse(savedProduct, savedRelations);
    }


    // este metodo genera un slug unico para la actualizacion de un producto,
    // recibe el nuevo nombre del producto y el id del producto que se esta actualizando,
    // genera un slug base a partir del nuevo nombre, y luego verifica si ese slug ya existe
    // en la base de datos para otro producto diferente al que se esta actualizando,
    // si existe un conflicto de slug, agrega un sufijo numerico al slug base hasta
    // encontrar un slug unico, y devuelve el slug unico generado, esto garantiza que al
    // actualizar el nombre de un producto, el slug se mantenga unico y no haya conflictos
    // con otros productos, incluso si el nuevo nombre es similar o igual al de otro producto,
    // el slug se ajustara automaticamente para evitar conflictos y mantener la
    // integridad de los slugs en la base de datos.
    private String generateUniqueSlugForUpdate(String nombre, Long currentProductId) {
        String baseSlug = SlugUtils.toSlug(nombre);

        String candidate = baseSlug;
        int suffix = 2;

        while (productoRepository.existsBySlugAndIdProductoNot(candidate, currentProductId)) {
            candidate = baseSlug + "-" + suffix;
            suffix++;
        }

        return candidate;
    }



    // este metodo desactiva un producto existente, recibe el id del producto a desactivar,
    // valida que el producto exista, cambia su estado a inactivo, guarda el producto,
    // y finalmente devuelve el producto desactivado en formato de respuesta detallada,
    // ademas registra la desactivacion en el log de auditoria con el usuario admin que
    // realizo la desactivacion, y una descripcion de la accion realizada
    @Transactional
    public ProductDetailResponse deactivate(Long idProducto) {
        Producto producto = productoRepository.findById(idProducto)
                .orElseThrow(() -> new NotFoundException("Producto no encontrado con id: " + idProducto));

        UsuarioAdmin admin = usuarioAdminRepository.findAll()
                .stream()
                .findFirst()
                .orElseThrow(() -> new BadRequestException("No existe un usuario admin para asociar la desactivación del producto."));

        boolean changed = producto.desactivar(admin);

        Producto savedProduct = productoRepository.save(producto);

        if (changed) {
            productoAuditLogRepository.save(new ProductoAuditLog(
                    savedProduct,
                    admin,
                    AuditAction.DEACTIVATED,
                    "Producto desactivado desde API admin."
            ));
        }

        List<ProductoCategoria> relaciones =
                productoCategoriaRepository.findByProducto_IdProducto(savedProduct.getIdProducto());

        return toDetailResponse(savedProduct, relaciones);
    }

    // este metodo activa un producto existente, recibe el id del producto a activar,
    // valida que el producto exista, cambia su estado a activo, guarda el producto,
    // y finalmente devuelve el producto activado en formato de respuesta detallada,
    // ademas registra la activacion en el log de auditoria con el usuario admin que
    // realizo la activacion, y una descripcion de la accion realizada

    @Transactional
    public ProductDetailResponse activate(Long idProducto) {
        Producto producto = productoRepository.findById(idProducto)
                .orElseThrow(() -> new NotFoundException("Producto no encontrado con id: " + idProducto));

        UsuarioAdmin admin = usuarioAdminRepository.findAll()
                .stream()
                .findFirst()
                .orElseThrow(() -> new BadRequestException("No existe un usuario admin para asociar la reactivación del producto."));

        boolean changed = producto.activar(admin);

        Producto savedProduct = productoRepository.save(producto);

        if (changed) {
            productoAuditLogRepository.save(new ProductoAuditLog(
                    savedProduct,
                    admin,
                    AuditAction.REACTIVATED,
                    "Producto reactivado desde API admin."
            ));
        }

        List<ProductoCategoria> relaciones =
                productoCategoriaRepository.findByProducto_IdProducto(savedProduct.getIdProducto());

        return toDetailResponse(savedProduct, relaciones);
    }
}
