package com.gabriela.store.category;

import com.gabriela.store.category.dto.CategoryResponse;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CategoriaService {

    private final CategoriaRepository categoriaRepository;

    public CategoriaService(CategoriaRepository categoriaRepository) {
        this.categoriaRepository = categoriaRepository;
    }

    @Transactional(readOnly = true)
    public List<CategoryResponse> findAll() {
        return categoriaRepository.findAll().stream()
                .map(categoria -> new CategoryResponse(
                        categoria.getIdCategoria(),
                        categoria.getNombre(),
                        categoria.getSlug()
                ))
                .toList();
    }

}
