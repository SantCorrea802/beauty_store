package com.gabriela.store.email;

public interface EmailSender {

    void sendVerificationEmail(String to, String name, String verificationUrl);

    void sendPasswordResetEmail(String to, String name, String passwordResetUrl);

    void sendAdminInvitationEmail(String to, String name, String invitationUrl);
}