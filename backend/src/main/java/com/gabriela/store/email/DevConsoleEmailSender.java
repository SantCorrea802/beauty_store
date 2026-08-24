package com.gabriela.store.email;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnProperty(
        name = "app.email.provider",
        havingValue = "dev",
        matchIfMissing = true
)
public class DevConsoleEmailSender implements EmailSender {

    @Override
    public void sendVerificationEmail(String to, String customerName, String verificationUrl) {
        System.out.println();
        System.out.println("==============================================");
        System.out.println("[DEV EMAIL] Verificación de correo");
        System.out.println("Para: " + to);
        System.out.println("Nombre: " + customerName);
        System.out.println("Link: " + verificationUrl);
        System.out.println("==============================================");
        System.out.println();
    }

    @Override
    public void sendPasswordResetEmail(String to, String customerName, String resetUrl) {
        System.out.println();
        System.out.println("==============================================");
        System.out.println("[DEV EMAIL] Recuperación de contraseña");
        System.out.println("Para: " + to);
        System.out.println("Nombre: " + customerName);
        System.out.println("Link: " + resetUrl);
        System.out.println("==============================================");
        System.out.println();
    }

    @Override
    public void sendAdminInvitationEmail(String to, String name, String invitationUrl) {
        System.out.println();
        System.out.println("==============================================");
        System.out.println("[DEV EMAIL] Invitación administrador");
        System.out.println("Para: " + to);
        System.out.println("Nombre: " + name);
        System.out.println("Link: " + invitationUrl);
        System.out.println("==============================================");
        System.out.println();
    }
}
