package com.gabriela.store.email;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnProperty(name = "app.email.provider", havingValue = "smtp")
public class SmtpEmailSender implements EmailSender {

    private final JavaMailSender mailSender;
    private final String fromEmail;
    private final String fromName;

    public SmtpEmailSender(
            JavaMailSender mailSender,
            @Value("${app.email.from}") String fromEmail,
            @Value("${app.email.from-name}") String fromName
    ) {
        this.mailSender = mailSender;
        this.fromEmail = fromEmail;
        this.fromName = fromName;
    }

    @Override
    public void sendVerificationEmail(String to, String customerName, String verificationUrl) {
        String subject = "Verifica tu correo - Tienda Gabriela";

        String html = """
                <div style="font-family: Arial, sans-serif; color: #33213d; line-height: 1.6;">
                  <h2>Verifica tu correo</h2>
                  <p>Hola %s,</p>
                  <p>Gracias por crear tu cuenta en <strong>Tienda Gabriela</strong>.</p>
                  <p>Para activar tu cuenta, haz clic en el siguiente botón:</p>
                  <p>
                    <a href="%s"
                       style="display:inline-block;padding:12px 18px;background:#744080;color:#ffffff;
                              text-decoration:none;border-radius:999px;font-weight:bold;">
                      Verificar correo
                    </a>
                  </p>
                  <p>Si el botón no funciona, copia y pega este enlace en tu navegador:</p>
                  <p><a href="%s">%s</a></p>
                  <p>Si tú no creaste esta cuenta, puedes ignorar este correo.</p>
                </div>
                """.formatted(escapeHtml(customerName), verificationUrl, verificationUrl, verificationUrl);

        sendHtmlEmail(to, subject, html);
    }

    @Override
    public void sendPasswordResetEmail(String to, String customerName, String resetUrl) {
        String subject = "Recupera tu contraseña - Tienda Gabriela";

        String html = """
                <div style="font-family: Arial, sans-serif; color: #33213d; line-height: 1.6;">
                  <h2>Recupera tu contraseña</h2>
                  <p>Hola %s,</p>
                  <p>Recibimos una solicitud para cambiar la contraseña de tu cuenta.</p>
                  <p>Haz clic en el siguiente botón para definir una nueva contraseña:</p>
                  <p>
                    <a href="%s"
                       style="display:inline-block;padding:12px 18px;background:#744080;color:#ffffff;
                              text-decoration:none;border-radius:999px;font-weight:bold;">
                      Cambiar contraseña
                    </a>
                  </p>
                  <p>Si el botón no funciona, copia y pega este enlace en tu navegador:</p>
                  <p><a href="%s">%s</a></p>
                  <p>Si tú no solicitaste este cambio, puedes ignorar este correo.</p>
                </div>
                """.formatted(escapeHtml(customerName), resetUrl, resetUrl, resetUrl);

        sendHtmlEmail(to, subject, html);
    }

    private void sendHtmlEmail(String to, String subject, String html) {
        try {
            MimeMessage message = mailSender.createMimeMessage();

            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromEmail, fromName);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(html, true);

            mailSender.send(message);
        } catch (MessagingException | MailException exception) {
            throw new IllegalStateException("No fue posible enviar el correo.", exception);
        } catch (Exception exception) {
            throw new IllegalStateException("Error inesperado enviando correo.", exception);
        }
    }

    private String escapeHtml(String value) {
        if (value == null) {
            return "";
        }

        return value
                .replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&#39;");
    }
}
