import smtplib
from email.message import EmailMessage

from app.config import settings


def is_smtp_configured() -> bool:
    return bool(settings.SMTP_HOST and settings.SMTP_FROM_EMAIL)


def send_password_reset_email(recipient: str, name: str, reset_url: str) -> None:
    if not is_smtp_configured():
        raise RuntimeError("SMTP_HOST y SMTP_FROM_EMAIL deben estar configurados")

    message = EmailMessage()
    message["Subject"] = "Restablece tu contraseña de Scentia"
    message["From"] = f"{settings.SMTP_FROM_NAME} <{settings.SMTP_FROM_EMAIL}>"
    message["To"] = recipient
    message.set_content(
        f"Hola {name},\n\n"
        "Recibimos una solicitud para cambiar la contraseña de tu cuenta Scentia. "
        "Abre este enlace dentro de los próximos 30 minutos:\n\n"
        f"{reset_url}\n\n"
        "Si no solicitaste este cambio, puedes ignorar este mensaje."
    )

    with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=15) as server:
        if settings.SMTP_USE_TLS:
            server.starttls()
        if settings.SMTP_USERNAME:
            server.login(settings.SMTP_USERNAME, settings.SMTP_PASSWORD)
        server.send_message(message)
