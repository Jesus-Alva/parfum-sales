# 🌸 Scentia — Registro de Ventas de Perfumes

Sistema elegante de registro de ventas con notificaciones por Telegram.

## 🏗️ Arquitectura

- **Backend**: FastAPI + SQLAlchemy + Alembic + Celery + Redis + Nginx
- **Frontend**: Next.js 14 (App Router) + TypeScript + Tailwind CSS + Framer Motion + Recharts + Zustand
- **Infra**: Docker + docker-compose

## 🚀 Puesta en marcha

```bash
git clone <repo>
cd scentia
cp .env.example .env
# Edita .env con tus credenciales (Telegram, secretos, etc.)
docker compose up --build
```

- Frontend: http://localhost:3000
- API: http://localhost/api/v1
- Docs: http://localhost/docs

### Migraciones Alembic

```bash
docker compose exec backend alembic revision --autogenerate -m "init"
docker compose exec backend alembic upgrade head
```

## 🔐 Configurar Telegram

1. Crea un bot con [@BotFather](https://t.me/BotFather)
2. Copia el token a `TELEGRAM_BOT_TOKEN`
3. Envía un mensaje al bot y obtén tu chat_id desde:
   `https://api.telegram.org/bot<TOKEN>/getUpdates`
4. Copia el chat_id a `TELEGRAM_CHAT_ID`

## 🔑 Recuperación de contraseña

El formulario de inicio de sesión permite solicitar un enlace de un solo uso. Los enlaces expiran en 30 minutos. Para habilitar el envío, configura estas variables en `.env` y recrea el backend:

```env
FRONTEND_BASE_URL=http://localhost:3005
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USERNAME=usuario_smtp
SMTP_PASSWORD=contraseña_smtp
SMTP_FROM_EMAIL=cuentas@example.com
SMTP_FROM_NAME=Scentia
SMTP_USE_TLS=true
```

`SMTP_USERNAME` y `SMTP_PASSWORD` pueden dejarse vacíos si el servidor SMTP no requiere autenticación. La contraseña nueva debe tener entre 8 y 72 caracteres y no superar el límite de 72 bytes de bcrypt. La migración de la tabla de tokens debe aplicarse con `docker compose exec backend alembic upgrade head`.

## 📍 Entregas y pedidos

Configura `BUSINESS_CITY` y `BUSINESS_STATE` en el archivo `.env` con el municipio y estado de la sede. Las compras con esos datos se mostrarán como entrega local y ofrecerán los puntos activos registrados por el administrador; las demás se registrarán para envío por paquetería.

El panel **Pedidos** permite buscar por folio, confirmar el punto y horario acordados, y marcar el pedido como entregado. Al finalizarlo aparecerá en **Ventas** y en las métricas de ventas completadas. Administra los puntos desde **Ubicaciones**. Los mapas usan Leaflet con mosaicos de OpenStreetMap; Photon geocodifica las direcciones escritas y el pin se puede corregir manualmente.

## 📦 Módulos

- **Auth**: registro / login con JWT
- **Perfumes**: CRUD con características (marca, familia, notas, stock, costo, precio)
- **Ventas**: registro con folio único + dirección + teléfono + nombre del comprador
- **Telegram**: notificación asíncrona vía Celery al registrar cada venta
- **Dashboard**: estadísticas y gráficos (ventas por día, costo vs precio vs ganancia)
- **Analytics**: reportes visuales

## 🔄 Roadmap

- [ ] Carrito multi-perfume
- [ ] Pasarela de pago
- [ ] Envío de email al comprador
- [ ] Roles avanzados (vendedor/admin)
- [ ] Exportación de reportes a CSV/PDF

## 🎨 Personalidad visual

- Paleta oscura con dorado (#d4af37) y rosa suave (#e8b4b8)
- Tipografía: **Playfair Display** para títulos, **Inter** para texto
- Animaciones: `framer-motion` (parallax, magnetic buttons, scroll reveal, 3D cards)
- Glassmorphism y glow dorado en componentes clave
