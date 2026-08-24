package com.gabriela.store.category;

import com.gabriela.store.category.dto.CategoryCreateRequest;
import com.gabriela.store.category.dto.CategoryResponse;
import com.gabriela.store.category.dto.CategoryUpdateRequest;
import com.gabriela.store.common.exception.BadRequestException;
import com.gabriela.store.common.exception.NotFoundException;
import com.gabriela.store.common.text.SlugUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.gabriela.store.product.ProductoCategoriaRepository;
import com.gabriela.store.audit.AdminAuditAction;
import com.gabriela.store.audit.AdminAuditEntityType;
import com.gabriela.store.audit.AdminAuditService;

import java.util.List;

@Service
public class AdminCategoryService {

    private final CategoriaRepository categoriaRepository;
    private final ProductoCategoriaRepository productoCategoriaRepository;
    private final AdminAuditService adminAuditService;

    public AdminCategoryService(
            CategoriaRepository categoriaRepository,
            ProductoCategoriaRepository productoCategoriaRepository,
            AdminAuditService adminAuditService
    ) {
        this.categoriaRepository = categoriaRepository;
        this.productoCategoriaRepository = productoCategoriaRepository;
        this.adminAuditService = adminAuditService;
    }

    // Aqui se podrían agregar métodos adicionales para funcionalidades específicas del administrador, como activar/desactivar categorías, etc.

    @Transactional(readOnly = true)
    public List<CategoryResponse> findAll() {
        return categoriaRepository.findAllByOrderByNombreAsc()
                .stream()
                .map(this::toResponse)
                .toList();
    }



    // Este metodo create y update se encargan de validar que el nombre de la categoría sea único
    // (ignorando mayúsculas) y generar un slug único basado en el nombre. Si ya existe
    // una categoría con el mismo nombre, se lanza una BadRequestException. Si la categoría a
    // actualizar no existe, se lanza una NotFoundException.
    @Transactional
    public CategoryResponse create(CategoryCreateRequest request) {
        String nombre = normalizeName(request.nombre());

        if (categoriaRepository.existsByNombreIgnoreCase(nombre)) {
            throw new BadRequestException("Ya existe una categoría con ese nombre.");
        }

        String slug = generateUniqueSlug(nombre);

        Categoria categoria = new Categoria(nombre, slug);

        Categoria savedCategory = categoriaRepository.save(categoria);

        adminAuditService.record(
                AdminAuditAction.CATEGORY_CREATED,
                AdminAuditEntityType.CATEGORY,
                savedCategory.getIdCategoria(),
                "Creó la categoría \"" + savedCategory.getNombre() + "\"."
        );

        return toResponse(savedCategory);
    }

    @Transactional
    public CategoryResponse update(Long idCategoria, CategoryUpdateRequest request) {
        Categoria categoria = categoriaRepository.findById(idCategoria)
                .orElseThrow(() -> new NotFoundException("Categoría no encontrada con id: " + idCategoria));

        String previousName = categoria.getNombre();

        String nombre = normalizeName(request.nombre());

        if (categoriaRepository.existsByNombreIgnoreCaseAndIdCategoriaNot(nombre, idCategoria)) {
            throw new BadRequestException("Ya existe otra categoría con ese nombre.");
        }

        String slug = generateUniqueSlugForUpdate(nombre, idCategoria);

        categoria.actualizarDatos(nombre, slug);

        Categoria savedCategory = categoriaRepository.save(categoria);

        adminAuditService.record(
                AdminAuditAction.CATEGORY_UPDATED,
                AdminAuditEntityType.CATEGORY,
                savedCategory.getIdCategoria(),
                "Actualizó la categoría \"" + previousName + "\" a \"" + savedCategory.getNombre() + "\"."
        );

        return toResponse(savedCategory);
    }


    // delete se encarga de eliminar una categoría por su ID. Si la categoría no existe, se lanza una NotFoundException.
    @Transactional
    public void delete(Long idCategoria) {
        Categoria categoria = categoriaRepository.findById(idCategoria)
                .orElseThrow(() -> new NotFoundException("Categoría no encontrada con id: " + idCategoria));

        if (productoCategoriaRepository.existsByCategoria_IdCategoria(idCategoria)) {
            throw new BadRequestException(
                    "No se puede eliminar la categoría porque tiene productos asociados. " +
                            "Primero reasigna o elimina la categoría de esos productos."
            );
        }

        adminAuditService.record(
                AdminAuditAction.CATEGORY_DELETED,
                AdminAuditEntityType.CATEGORY,
                categoria.getIdCategoria(),
                "Eliminó la categoría \"" + categoria.getNombre() + "\"."
        );

        categoriaRepository.delete(categoria);
    }



    // normalizeName se encarga de eliminar espacios en blanco al inicio y al final del nombre de la categoría.
    // se usa en los métodos create y update para asegurar que el nombre se guarde de forma consistente, sin espacios innecesarios.
    private String normalizeName(String value) {
        return value.trim();
    }


    // aqui se generan los slugs únicos para las categorías. El metodo generateUniqueSlug toma
    // el nombre de la categoría, lo convierte a un slug base utilizando SlugUtils.toSlug, y
    // luego verifica si ese slug ya existe en la base de datos. Si existe, agrega un sufijo numérico
    // (por ejemplo, "-2", "-3", etc.) hasta encontrar un slug que no esté en uso. El metodo
    // generateUniqueSlugForUpdate hace lo mismo pero también excluye la categoría actual
    // (identificada por currentCategoryId) para evitar conflictos al actualizar una categoría existente.
    // se usa en los métodos create y update para asegurar que cada categoría tenga un slug único basado en su nombre, lo que es importante para la generación de URLs amigables y para evitar conflictos en la base de datos.
    private String generateUniqueSlug(String nombre) {
        String baseSlug = SlugUtils.toSlug(nombre);

        String candidate = baseSlug;
        int suffix = 2;

        while (categoriaRepository.existsBySlug(candidate)) {
            candidate = baseSlug + "-" + suffix;
            suffix++;
        }

        return candidate;
    }

    private String generateUniqueSlugForUpdate(String nombre, Long currentCategoryId) {
        String baseSlug = SlugUtils.toSlug(nombre);

        String candidate = baseSlug;
        int suffix = 2;

        while (categoriaRepository.existsBySlugAndIdCategoriaNot(candidate, currentCategoryId)) {
            candidate = baseSlug + "-" + suffix;
            suffix++;
        }

        return candidate;
    }

    // toresponse se encarga de convertir una entidad Categoria a un DTO CategoryResponse. Este
    // metodo se utiliza en los métodos findAll, create y update para transformar las entidades
    // recuperadas o modificadas en objetos de respuesta que se pueden enviar al cliente.
    // Al centralizar esta lógica de conversión en un metodo separado, se mejora la mantenibilidad y
    // la claridad del código, evitando la duplicación de código de conversión en múltiples lugares.

    private CategoryResponse toResponse(Categoria categoria) {
        return new CategoryResponse(
                categoria.getIdCategoria(),
                categoria.getNombre(),
                categoria.getSlug()
        );
    }
}