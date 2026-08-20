package com.gabriela.store.email;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

@Component
public class DevConsoleEmailSender implements EmailSender {

    private static final Logger logger = LoggerFactory.getLogger(DevConsoleEmailSender.class);

    @Override
    public void sendVerificationEmail(String to, String name, String verificationUrl) {
        logger.info("""
                
                ============================================================
                [DEV EMAIL] Verificación de correo
                Para: {}
                Nombre: {}
                
                Link de verificación:
                {}
                ============================================================
                """, to, name, verificationUrl);
    }
}