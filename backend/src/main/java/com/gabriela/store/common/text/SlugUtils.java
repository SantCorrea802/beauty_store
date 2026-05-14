package com.gabriela.store.common.text;

import java.text.Normalizer;
import java.util.Locale;

public class SlugUtils {

    private SlugUtils() {

    }

    public static String toSlug(String input){
        if (input == null || input.isBlank()) {
            throw new IllegalArgumentException("El texto para generar el slug no puede estar vacio.");
        }
        String normalized = Normalizer.normalize(input, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "");

        return normalized
                .toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9\\s-]", "")
                .trim()
                .replaceAll("\\s+", "-")
                .replaceAll("-+", "-");
    }
    }



}
