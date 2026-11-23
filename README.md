# ScentiA — Perfumes y pedidos

Aplicación para administrar perfumes, marcas, decanters, usuarios, pedidos, entregas locales y reseñas. La solución está formada por un frontend Next.js, una API FastAPI, PostgreSQL y Redis/Celery para tareas de notificación.

## Requisitos para ejecutar localmente

- Docker Engine y Docker Compose v2 (`docker compose`)
- Git
- OpenSSL para generar una clave segura (opcional, pero recomendado)

La configuración local usa Docker Compose. No hace falta instalar Node.js ni Python en la computadora.

## Inicio local

Desde la raíz del repositorio:

```bash
cp .env.example .env
openssl rand -hex 32
```

Copia el valor generado por OpenSSL en `SECRET_KEY` dentro de `.env`. Cambia también las contraseñas locales de PostgreSQL y pgAdmin si lo necesitas. No subas `.env` al repositorio.

Inicia los servicios:

```bash
docker compose up --build -d
docker compose ps
```

Para consultar los logs:

```bash
docker compose logs -f backend frontend
```

Al iniciar, el backend ejecuta las migraciones de Alembic automáticamente. Los servicios y direcciones locales son:

| Servicio | Dirección |
| --- | --- |
| Frontend | `http://localhost:3005` |
| Swagger UI | `http://localhost/docs` |
| API directa | `http://localhost:8005/api/v1` |
| API health check | `http://localhost/api/v1/health` |
| pgAdmin | `http://localhost:5050` |
| PostgreSQL | `localhost:5432` |
| Redis | `localhost:6379` |

El navegador accede a la API mediante Nginx en el puerto 80. Si un puerto ya está ocupado, cambia la asignación correspondiente en `docker-compose.yml`.

Registra una cuenta desde `http://localhost:3005/register`. Las cuentas nuevas empiezan como clientes. Para preparar el primer administrador local, primero crea la cuenta y luego sigue el apartado [Primer administrador](#primer-administrador-local).

### Migraciones de base de datos

El contenedor de backend ejecuta `alembic upgrade head` al iniciar. También puedes aplicarlas manualmente:

```bash
docker compose exec backend alembic upgrade head
```

Para crear una migración después de modificar modelos SQLAlchemy:

```bash
docker compose exec backend alembic revision --autogenerate -m "describe el cambio"
docker compose exec backend alembic upgrade head
```

Revisa el archivo generado antes de aplicarlo o compartirlo.

## Variables de entorno

La plantilla [.env.example](.env.example) contiene valores de desarrollo. Cópiala a `.env`; Docker Compose entrega estas variables a los servicios.

| Variable(s) | Uso |
| --- | --- |
| `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB` | Usuario, contraseña y base local de PostgreSQL. |
| `DATABASE_URL` | Conexión del backend a PostgreSQL. En Docker usa el hostname `postgres`, no `localhost`. |
| `SECRET_KEY`, `ALGORITHM`, `ACCESS_TOKEN_EXPIRE_MINUTES` | Firma y duración de los tokens JWT. Usa una `SECRET_KEY` aleatoria y privada. |
| `REDIS_URL`, `CELERY_BROKER_URL`, `CELERY_RESULT_BACKEND` | Conexiones internas a Redis para tareas asíncronas. |
| `BACKEND_CORS_ORIGINS`, `FRONTEND_BASE_URL` | Orígenes permitidos por CORS y base de los enlaces de recuperación de contraseña. |
| `NEXT_PUBLIC_API_URL` | URL de la API que usa el navegador. Para Compose local: `http://localhost/api/v1`. |
| `NEXT_PUBLIC_SITE_URL` | URL base usada por canonical, tarjetas sociales y sitemap. Para Compose local: `http://localhost:3005`. |
| `APP_LAN_IP`, `NEXT_PUBLIC_APP_LAN_IP` | IP opcional para probar desde otros dispositivos de la red local. Configura la misma IP en ambas. |
| `PGADMIN_DEFAULT_EMAIL`, `PGADMIN_DEFAULT_PASSWORD`, `PGADMIN_PORT` | Acceso local a pgAdmin. |
| `BUSINESS_CITY`, `BUSINESS_STATE` | Datos de la zona del negocio que consumen los endpoints de ubicaciones. |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USERNAME`, `SMTP_PASSWORD`, `SMTP_FROM_EMAIL`, `SMTP_FROM_NAME`, `SMTP_USE_TLS` | Servidor de correo para recuperación de contraseña. |
| `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID` | Notificaciones de nuevos pedidos en Telegram. |
| `WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_TO_NUMBER` | Integración opcional de WhatsApp Cloud API. El envío requiere una plantilla aprobada configurada en Meta. |
| `WHATSAPP_API_VERSION`, `WHATSAPP_ORDER_TEMPLATE`, `WHATSAPP_TEMPLATE_LANGUAGE` | Versión de Graph API, nombre y lenguaje de la plantilla de WhatsApp. |
| `NEXT_PUBLIC_GTM_ID`, `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Identificadores opcionales de Google Tag Manager y Google Analytics. |
| `UPLOAD_DIR`, `BACKUP_DIR` | Directorios de imágenes y archivos de respaldo dentro del contenedor. Compose los monta en el proyecto local. |

Los proveedores SMTP, Telegram, WhatsApp y Google son opcionales para levantar la aplicación. Sin configurar SMTP no se enviarán enlaces de recuperación; sin Telegram/WhatsApp, las tareas de notificación no podrán entregar mensajes.

## Respaldar y restaurar PostgreSQL

Los respaldos de base de datos son archivos PostgreSQL en formato custom `.dump`. Antes de restaurar, detén operaciones de escritura y guarda un respaldo del estado actual: la restauración reemplaza objetos y datos existentes en la base seleccionada.

### Crear un respaldo local

```bash
mkdir -p backups
docker compose exec -T postgres sh -lc \
  'pg_dump --format=custom --no-owner --no-acl --username="$POSTGRES_USER" --dbname="$POSTGRES_DB"' \
  > backups/scentia-before-restore.dump
```

### Restaurar un archivo `.dump` en la base local

Coloca el archivo, por ejemplo, en `backups/scentia-backup.dump` y ejecuta:

```bash
docker compose exec -T postgres sh -lc \
  'pg_restore --clean --if-exists --no-owner --no-acl --exit-on-error --username="$POSTGRES_USER" --dbname="$POSTGRES_DB"' \
  < backups/scentia-backup.dump
```

Después de restaurar, reaplica las migraciones pendientes y revisa los logs:

```bash
docker compose exec backend alembic upgrade head
docker compose logs --tail=100 backend
```

Para importar imágenes guardadas en un archivo que contiene una carpeta raíz `uploads/`:

```bash
mkdir -p backend/uploads
tar -xzf parfum-sales-uploads.tar.gz --strip-components=1 -C backend/uploads
```

La base de datos y las imágenes son datos separados: restaurar el `.dump` no restaura los archivos de `uploads`.

> Estos comandos restauran únicamente la base local del servicio Compose `postgres`. Para Railway, usa la URL pública de conexión de PostgreSQL y verifica cuidadosamente el proyecto, entorno y base destino antes de restaurar.

El módulo **Respaldos** del panel también permite descargar respaldos de base de datos; requiere iniciar sesión como administrador.

## Swagger y autenticación de la API

En local abre [http://localhost/docs](http://localhost/docs). En producción, Swagger está en `https://backend-production-38a61319.up.railway.app/docs` mientras ese dominio siga vigente.

1. En Swagger, ejecuta `POST /api/v1/auth/login` con el correo y contraseña de una cuenta existente:

   ```json
   {
     "email": "tu-correo@example.com",
     "password": "tu-contraseña"
   }
   ```

2. Copia el campo `access_token` de la respuesta.
3. Pulsa **Authorize** y pega el token. Swagger añade el esquema `Bearer` automáticamente.
4. Ejecuta los endpoints protegidos. Para endpoints de administración debes autenticarte con una cuenta cuyo campo `is_admin` sea `true`.

Los endpoints públicos, como consultar perfumes, pueden probarse sin token. No hay credenciales predeterminadas ni contraseñas de ejemplo.

### Primer administrador local

Registra primero la cuenta desde la aplicación. Luego abre `psql` dentro del contenedor:

```bash
docker compose exec postgres sh -lc 'psql --username="$POSTGRES_USER" --dbname="$POSTGRES_DB"'
```

En el prompt de PostgreSQL, promueve únicamente la cuenta que administrará el entorno local:

```sql
UPDATE users SET is_admin = TRUE WHERE email = 'tu-correo@example.com';
\q
```

Inicia sesión nuevamente para obtener un token actualizado con privilegios de administrador.

## Despliegue en Railway

El despliegue productivo utiliza servicios separados para Frontend, Backend y PostgreSQL; las imágenes se almacenan en un volumen persistente montado en `/app/uploads` en Backend. Configura las variables de producción en Railway, incluida `DATABASE_URL`, `SECRET_KEY`, `BACKEND_CORS_ORIGINS`, `FRONTEND_BASE_URL`, `NEXT_PUBLIC_API_URL` y `NEXT_PUBLIC_SITE_URL`. No copies las contraseñas locales de `.env.example` a producción.

Los dominios de Railway pueden cambiar. Para obtener el Swagger del backend, abre el dominio público vigente del servicio Backend y añade `/docs`.
