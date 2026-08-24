package com.gabriela.store.email;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.gabriela.store.common.exception.BadRequestException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.Map;

@Component
@ConditionalOnProperty(name = "app.email.provider", havingValue = "resend-api")
public class ResendApiEmailSender implements EmailSender {

    private static final String BUTTON_BACKGROUND = "#744080";
    private static final String TEXT_COLOR = "#33213d";

    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;
    private final String apiKey;
    private final String apiUrl;
    private final String fromEmail;
    private final String fromName;
    private final String brandName;

    public ResendApiEmailSender(
            ObjectMapper objectMapper,
            @Value("${app.resend.api-key}") String apiKey,
            @Value("${app.resend.api-url}") String apiUrl,
            @Value("${app.email.from}") String fromEmail,
            @Value("${app.email.from-name}") String fromName,
            @Value("${app.brand.name:Hajuvi}") String brandName
    ) {
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(10))
                .build();

        this.objectMapper = objectMapper;
        this.apiKey = requireNonBlank(apiKey, "RESEND_API_KEY no está configurado.");
        this.apiUrl = requireNonBlank(apiUrl, "RESEND_API_URL no está configurado.");
        this.fromEmail = requireNonBlank(fromEmail, "app.email.from no está configurado.");
        this.fromName = requireNonBlank(fromName, "app.email.from-name no está configurado.");
        this.brandName = requireNonBlank(brandName, "app.brand.name no está configurado.");
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
        String safeBrandName = escapeHtml(brandName);
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
                safeBrandName,
                safeResetUrl,
                BUTTON_BACKGROUND,
                safeResetUrl,
                safeResetUrl
        );

        sendHtmlEmail(to, subject, html);
    }

    @Override
    public void sendAdminInvitationEmail(String to, String name, String invitationUrl) {
        String subject = "Invitación al panel admin - " + brandName;

        String safeName = escapeHtml(name);
        String safeBrandName = escapeHtml(brandName);
        String safeInvitationUrl = escapeHtml(invitationUrl);

        String html = """
            <div style="font-family: Arial, sans-serif; color: %s; line-height: 1.6;">
              <h2>Invitación al panel administrador</h2>
              <p>Hola %s,</p>
              <p>Has sido invitado/a a administrar <strong>%s</strong>.</p>
              <p>Para aceptar la invitación y definir tu contraseña, haz clic en el siguiente botón:</p>
              <p>
                <a href="%s"
                   style="display:inline-block;padding:12px 18px;background:%s;color:#ffffff;
                          text-decoration:none;border-radius:999px;font-weight:bold;">
                  Aceptar invitación
                </a>
              </p>
              <p>Si el botón no funciona, copia y pega este enlace en tu navegador:</p>
              <p><a href="%s">%s</a></p>
              <p>Si no esperabas esta invitación, puedes ignorar este correo.</p>
            </div>
            """.formatted(
                TEXT_COLOR,
                safeName,
                safeBrandName,
                safeInvitationUrl,
                BUTTON_BACKGROUND,
                safeInvitationUrl,
                safeInvitationUrl
        );

        sendHtmlEmail(to, subject, html);
    }

    private void sendHtmlEmail(String to, String subject, String html) {
        String body = serializeRequestBody(to, subject, html);

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(apiUrl))
                .timeout(Duration.ofSeconds(20))
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + apiKey)
                .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .POST(HttpRequest.BodyPublishers.ofString(body))
                .build();

        try {
            HttpResponse<String> response = httpClient.send(
                    request,
                    HttpResponse.BodyHandlers.ofString()
            );

            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                throw new BadRequestException(
                        "Resend rechazó el envío del correo. HTTP "
                                + response.statusCode()
                                + ": "
                                + response.body()
                );
            }
        } catch (IOException exception) {
            throw new IllegalStateException("No fue posible comunicarse con Resend.", exception);
        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt();
            throw new IllegalStateException("El envío de correo fue interrumpido.", exception);
        }
    }

    private String serializeRequestBody(String to, String subject, String html) {
        try {
            return objectMapper.writeValueAsString(Map.of(
                    "from", fromName + " <" + fromEmail + ">",
                    "to", new String[]{to},
                    "subject", subject,
                    "html", html
            ));
        } catch (JsonProcessingException exception) {
            throw new IllegalStateException("No fue posible serializar el correo para Resend.", exception);
        }
    }

    private String requireNonBlank(String value, String message) {
        if (value == null || value.isBlank()) {
            throw new IllegalStateException(message);
        }

        return value.trim();
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