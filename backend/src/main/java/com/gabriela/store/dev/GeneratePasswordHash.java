package com.gabriela.store.dev;


import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;


public class GeneratePasswordHash {


    public static void main(String[] args) {
        System.out.println(new BCryptPasswordEncoder().encode("CambiarLuego2026!"));
    }
}
