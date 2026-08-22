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

    private static final String BUTTON_BACKGROUND = "#744080";
    private static final String TEXT_COLOR = "#33213d";

    private final JavaMailSender mailSender;
    private final String fromEmail;
    private final String fromName;
    private final String brandName;

    public SmtpEmailSender(
            JavaMailSender mailSender,
            @Value("${app.email.from}") String fromEmail,
            @Value("${app.email.from-name}") String fromName,
            @Value("${app.brand.name:Hajuvi}") String brandName
    ) {
        this.mailSender = mailSender;
        this.fromEmail = fromEmail;
        this.fromName = fromName;
        this.brandName = brandName;
    }

    @Override
    public void sendVerificationEmail(String to, String customerName, String verificationUrl) {
        String subject = "Verifica tu correo - " + brandName;

        String safeCustomerName = escapeHtml(customerName);
        String safeBrandName = escapeHtml(brandName);
        String safeVerificationUrl = escapeHtml(verificationUrl);

        String html = """
                <div style="font-family: Arial, sans-serif; color: %s; line-height: 1.6;">
                  <h2>Verifica tu correo</h2>
                  <p>Hola %s,</p>
                  <p>Gracias por crear tu cuenta en <strong>%s</strong>.</p>
                  <p>Para activar tu cuenta, haz clic en el siguiente botón:</p>
                  <p>
                    <a href="%s"
                       style="display:inline-block;padding:12px 18px;background:%s;color:#ffffff;
                              text-decoration:none;border-radius:999px;font-weight:bold;">
                      Verificar correo
                    </a>
                  </p>
                  <p>Si el botón no funciona, copia y pega este enlace en tu navegador:</p>
                  <p><a href="%s">%s</a></p>
                  <p>Si tú no creaste esta cuenta, puedes ignorar este correo.</p>
                </div>
                """.formatted(
                TEXT_COLOR,
                safeCustomerName,
                safeBrandName,
                safeVerificationUrl,
                BUTTON_BACKGROUND,
                safeVerificationUrl,
                safeVerificationUrl
        );

        sendHtmlEmail(to, subject, html);
    }

    @Override
    public void sendPasswordResetEmail(String to, String customerName, String resetUrl) {
        String subject = "Recupera tu contraseña - " + brandName;

        String safeCustomerName = escapeHtml(customerName);
        String safeResetUrl = escapeHtml(resetUrl);

        String html = """
                <div style="font-family: Arial, sans-serif; color: %s; line-height: 1.6;">
                  <h2>Recupera tu contraseña</h2>
                  <p>Hola %s,</p>
                  <p>Recibimos una solicitud para cambiar la contraseña de tu cuenta en <strong>%s</strong>.</p>
                  <p>Haz clic en el siguiente botón para definir una nueva contraseña:</p>
                  <p>
                    <a href="%s"
                       style="display:inline-block;padding:12px 18px;background:%s;color:#ffffff;
                              text-decoration:none;border-radius:999px;font-weight:bold;">
                      Cambiar contraseña
                    </a>
                  </p>
                  <p>Si el botón no funciona, copia y pega este enlace en tu navegador:</p>
                  <p><a href="%s">%s</a></p>
                  <p>Si tú no solicitaste este cambio, puedes ignorar este correo.</p>
                </div>
                """.formatted(
                TEXT_COLOR,
                safeCustomerName,
                escapeHtml(brandName),
                safeResetUrl,
                BUTTON_BACKGROUND,
                safeResetUrl,
                safeResetUrl
        );

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