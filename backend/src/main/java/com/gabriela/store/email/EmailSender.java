package com.gabriela.store.email;

public interface EmailSender {

    void sendVerificationEmail(String to, String name, String verificationUrl);
}