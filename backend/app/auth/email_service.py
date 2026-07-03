"""
Servicio de envío de emails para GameLife.
Usa smtplib (librería estándar de Python) con STARTTLS.
El envío ocurre en un hilo separado para no bloquear la respuesta HTTP.
"""

import smtplib
import logging
import threading
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from ..config import get_settings

logger = logging.getLogger(__name__)


def _build_welcome_html(username: str) -> str:
    """Construye el HTML del correo de bienvenida."""
    return f"""<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Bienvenido a GameLife</title>
</head>
<body style="margin:0;padding:0;background-color:#0f0f19;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f0f19;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0"
               style="background:linear-gradient(160deg,#1e1b4b 0%,#1e293b 100%);
                      border-radius:16px;overflow:hidden;
                      border:1px solid rgba(139,92,246,0.3);
                      box-shadow:0 0 40px rgba(139,92,246,0.15);">

          <!-- HEADER -->
          <tr>
            <td align="center"
                style="padding:40px 40px 28px;
                       background:linear-gradient(135deg,rgba(139,92,246,0.25),rgba(99,102,241,0.15));
                       border-bottom:1px solid rgba(139,92,246,0.2);">
              <div style="font-size:48px;margin-bottom:12px;">🎮</div>
              <h1 style="margin:0;font-size:32px;font-weight:800;letter-spacing:-0.5px;
                         background:linear-gradient(135deg,#a78bfa,#06b6d4);
                         -webkit-background-clip:text;color:#a78bfa;">
                GameLife
              </h1>
              <p style="margin:6px 0 0;color:#94a3b8;font-size:13px;letter-spacing:1px;text-transform:uppercase;">
                Tu red social de videojuegos
              </p>
            </td>
          </tr>

          <!-- BODY -->
          <tr>
            <td style="padding:44px 44px 36px;">

              <h2 style="margin:0 0 16px;color:#f1f5f9;font-size:24px;font-weight:700;">
                ¡Bienvenido, <span style="color:#a78bfa;">{username}</span>! 🚀
              </h2>

              <p style="margin:0 0 20px;color:#cbd5e1;font-size:16px;line-height:1.7;">
                Has dado el primer paso para unirte a la comunidad de jugadores que más importa.
                En <strong style="color:#a78bfa;">GameLife</strong>, tu opinión no es solo un número
                de estrellas — es una guía real para miles de jugadores que están buscando su
                próxima aventura.
              </p>

              <!-- Feature highlights -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin:28px 0;">
                <tr>
                  <td style="padding:16px;background:rgba(139,92,246,0.1);border-radius:10px;
                             border:1px solid rgba(139,92,246,0.2);margin-bottom:12px;
                             display:block;margin:0 0 12px;">
                    <span style="font-size:22px;">✍️</span>
                    <p style="margin:6px 0 0;color:#e2e8f0;font-size:15px;font-weight:600;">
                      Tu reseña, su próxima partida
                    </p>
                    <p style="margin:4px 0 0;color:#94a3b8;font-size:13px;line-height:1.6;">
                      Comparte lo que sentiste al jugar. Cada reseña que publicas puede ayudar a
                      otro jugador a decidir si merece la pena invertir su tiempo y dinero.
                    </p>
                  </td>
                </tr>
                <tr><td style="height:10px;"></td></tr>
                <tr>
                  <td style="padding:16px;background:rgba(6,182,212,0.08);border-radius:10px;
                             border:1px solid rgba(6,182,212,0.2);">
                    <span style="font-size:22px;">📰</span>
                    <p style="margin:6px 0 0;color:#e2e8f0;font-size:15px;font-weight:600;">
                      Un feed hecho para ti
                    </p>
                    <p style="margin:4px 0 0;color:#94a3b8;font-size:13px;line-height:1.6;">
                      Sigue a otros jugadores y descubre qué están jugando ahora mismo.
                      Tu feed se personaliza con las reseñas de quienes te inspiran.
                    </p>
                  </td>
                </tr>
                <tr><td style="height:10px;"></td></tr>
                <tr>
                  <td style="padding:16px;background:rgba(245,158,11,0.07);border-radius:10px;
                             border:1px solid rgba(245,158,11,0.18);">
                    <span style="font-size:22px;">⭐</span>
                    <p style="margin:6px 0 0;color:#e2e8f0;font-size:15px;font-weight:600;">
                      Descubre los mejores juegos
                    </p>
                    <p style="margin:4px 0 0;color:#94a3b8;font-size:13px;line-height:1.6;">
                      Explora nuestro catálogo de videojuegos con reseñas reales de la comunidad.
                      Sin análisis de revistas, sin marketing — solo la voz de los jugadores.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:32px;">
                <tr>
                  <td align="center">
                    <a href="http://localhost:4200"
                       style="display:inline-block;padding:14px 40px;
                              background:linear-gradient(135deg,#8b5cf6,#6d28d9);
                              color:#ffffff;text-decoration:none;border-radius:10px;
                              font-weight:700;font-size:16px;letter-spacing:0.3px;
                              box-shadow:0 4px 20px rgba(139,92,246,0.4);">
                      🎮 Empezar a explorar
                    </a>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="padding:24px 44px;border-top:1px solid rgba(255,255,255,0.06);
                       text-align:center;">
              <p style="margin:0;color:#475569;font-size:12px;line-height:1.6;">
                Este mensaje fue enviado porque te registraste en <strong style="color:#64748b;">GameLife</strong>.<br/>
                Si no fuiste tú, puedes ignorar este correo con total seguridad.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>"""


def _send_email_sync(to_email: str, to_name: str) -> None:
    """Envía el email de forma síncrona (ejecutado en un hilo separado)."""
    settings = get_settings()

    if not settings.SMTP_HOST or not settings.SMTP_USER or not settings.SMTP_PASSWORD:
        logger.warning(
            "Email de bienvenida no enviado: SMTP no configurado en .env "
            "(SMTP_HOST, SMTP_USER, SMTP_PASSWORD)"
        )
        return

    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = "🎮 ¡Bienvenido a GameLife! Tu aventura comienza aquí"
        msg["From"] = f"{settings.SMTP_FROM_NAME} <{settings.SMTP_FROM_EMAIL or settings.SMTP_USER}>"
        msg["To"] = to_email

        # Texto plano como fallback
        plain_text = (
            f"¡Hola {to_name}!\n\n"
            "Bienvenido a GameLife, la red social de videojuegos donde tu opinión importa.\n"
            "Comparte tus reseñas, sigue a otros jugadores y ayuda a la comunidad a\n"
            "descubrir los mejores juegos.\n\n"
            "Empieza ahora: http://localhost:4200\n\n"
            "— El equipo de GameLife 🎮"
        )
        msg.attach(MIMEText(plain_text, "plain", "utf-8"))
        msg.attach(MIMEText(_build_welcome_html(to_name), "html", "utf-8"))

        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=10) as server:
            server.ehlo()
            server.starttls()
            server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.sendmail(msg["From"], [to_email], msg.as_string())

        logger.info("Email de bienvenida enviado a %s", to_email)

    except Exception as exc:
        # El fallo de email nunca debe interrumpir el registro del usuario
        logger.error("Error al enviar email de bienvenida a %s: %s", to_email, exc)


def send_welcome_email(to_email: str, username: str) -> None:
    """
    Envía el email de bienvenida en un hilo de fondo.
    No bloquea la respuesta HTTP del endpoint de registro.
    """
    thread = threading.Thread(
        target=_send_email_sync,
        args=(to_email, username),
        daemon=True
    )
    thread.start()
