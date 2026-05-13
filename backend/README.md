# Backend - Tienda

Backend de catálogo para una tienda de productos de belleza, maquillaje, cuidado capilar e higiene personal.

Este servicio expone una API REST construida con Spring Boot. Actualmente permite consultar categorías y productos públicos. La base de datos está versionada con Flyway y corre localmente sobre PostgreSQL usando Docker Compose.

---

## Stack técnico

- Java 17
- Spring Boot 3.5.x
- Maven
- Spring Web
- Spring Data JPA
- Spring Security
- PostgreSQL
- Flyway
- Lombok
- Docker Compose

---

## Estructura principal

```text
backend/
├── src/
│   └── main/
│       ├── java/com/gabriela/store/
│       │   ├── StoreApplication.java
│       │   ├── audit/
│       │   ├── auth/
│       │   ├── category/
│       │   ├── common/
│       │   ├── config/
│       │   ├── image/
│       │   ├── product/
│       │   └── user/
│       │
│       └── resources/
│           ├── application.properties
│           └── db/migration/
│               └── V1__init_schema.sql
│
├── docker-compose.yml
├── .env.example
├── pom.xml
├── mvnw
└── mvnw.cmd
```

---

## Arquitectura actual

Flujo general de una petición:

```text
Cliente HTTP
    ↓
Controller
    ↓
Service
    ↓
Repository
    ↓
JPA / Hibernate
    ↓
PostgreSQL
```

Flyway se encarga de crear y versionar el esquema de base de datos antes de que Hibernate valide las entidades.

---

## Modelo de datos actual

Tablas principales:

```text
usuario_admin
producto
categoria
producto_categoria
imagen_producto
producto_audit_log
flyway_schema_history
```

Relaciones principales:

```text
producto N:M categoria
producto 1:N imagen_producto
producto 1:N producto_audit_log
usuario_admin 1:N producto_audit_log
usuario_admin 1:N producto como creado_por / actualizado_por
```

La relación muchos a muchos entre productos y categorías se resuelve con la tabla intermedia:

```text
producto_categoria
```

---

## Variables de entorno

El archivo real `.env` no debe subirse al repositorio.

Existe una plantilla:

```text
.env.example
```

Ejemplo:

```env
POSTGRES_DB=beauty_store
POSTGRES_USER=beauty_user
POSTGRES_PASSWORD=change_me
POSTGRES_PORT=5433

DB_URL=jdbc:postgresql://127.0.0.1:5433/beauty_store
DB_USERNAME=beauty_user
DB_PASSWORD=change_me
```

Para desarrollo local, crea un archivo:

```text
.env
```

con valores reales locales


---

## Configuración de Spring Boot

`application.properties` usa variables de entorno:

```properties
spring.application.name=store

spring.datasource.url=${DB_URL}
spring.datasource.username=${DB_USERNAME}
spring.datasource.password=${DB_PASSWORD}

spring.jpa.hibernate.ddl-auto=validate
spring.jpa.show-sql=true
spring.jpa.open-in-view=false

spring.flyway.enabled=true
```

Puntos importantes:

- `ddl-auto=validate` hace que Hibernate no cree ni modifique tablas.
- Flyway ejecuta las migraciones SQL.
- Hibernate solo valida que las entidades Java coincidan con el esquema real.
- Las credenciales reales deben venir de variables de entorno o del entorno de ejecución.

---

## Levantar PostgreSQL local

Desde la carpeta `backend/`:

```bash
docker compose up -d
```

Verificar contenedor:

```bash
docker compose ps
```

Verificar conexión:

```bash
docker compose exec -e PGPASSWORD=beauty_password_local postgres psql -h 127.0.0.1 -U beauty_user -d beauty_store -c "SELECT current_database(), current_user;"
```

Si se cambia el usuario, contraseña, nombre de BD o puerto antes de tener datos importantes, se puede recrear el volumen local:

```bash
docker compose down -v
docker compose up -d
```

Advertencia: `down -v` borra los datos locales de PostgreSQL.

---

## Conexión desde DBeaver

Usar estos datos para desarrollo local:

```text
Host: 127.0.0.1
Port: valor de POSTGRES_PORT en backend/.env
Database: valor de POSTGRES_DB en backend/.env
Username: valor de POSTGRES_USER en backend/.env
Password: valor de POSTGRES_PASSWORD en backend/.env
SSL: disabled
Authentication: Database Native
```

---

## Ejecutar backend

Desde IntelliJ o desde terminal.

Con Maven Wrapper:

```bash
./mvnw spring-boot:run
```

En Windows:

```bash
mvnw.cmd spring-boot:run
```

La aplicación levanta por defecto en:

```text
http://localhost:8080
```

---

## Migraciones con Flyway

Las migraciones están en:

```text
src/main/resources/db/migration/
```

Migración inicial:

```text
V1__init_schema.sql
```

Flyway crea y mantiene la tabla:

```text
flyway_schema_history
```

Para verificar tablas desde DBeaver o psql:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

Para verificar migraciones ejecutadas:

```sql
SELECT *
FROM flyway_schema_history;
```

Importante:

- Si `V1__init_schema.sql` ya fue ejecutado, no debe editarse en entornos compartidos o con datos reales.
- Cambios futuros deben ir en nuevas migraciones:

```text
V2__...
V3__...
```

---

## Entidades JPA implementadas

Paquetes actuales:

```text
user/
category/
product/
image/
audit/
```

Entidades principales:

```text
UsuarioAdmin
Categoria
Producto
ProductoCategoria
ImagenProducto
ProductoAuditLog
```

Repositories principales:

```text
UsuarioAdminRepository
CategoriaRepository
ProductoRepository
ProductoCategoriaRepository
ImagenProductoRepository
ProductoAuditLogRepository
```

---

## Endpoints públicos actuales

### Listar categorías

```http
GET /api/categories
```

Ejemplo de respuesta:

```json
[
  {
    "id": 1,
    "nombre": "Maquillaje",
    "slug": "maquillaje"
  }
]
```

---

### Listar productos activos

```http
GET /api/products
```

Ejemplo de respuesta:

```json
[
  {
    "id": 1,
    "nombre": "Gloss rosado",
    "precio": 14000.00,
    "descripcion": "Gloss rosado hidratante para labios.",
    "slug": "gloss-rosado",
    "activo": true,
    "marca": "Marca demo"
  }
]
```

---

### Filtrar productos por categoría

```http
GET /api/products?category=maquillaje
```

Devuelve productos activos asociados a la categoría indicada por su `slug`.

---

### Consultar detalle de producto por slug

```http
GET /api/products/{slug}
```

Ejemplo:

```http
GET /api/products/gloss-rosado
```

Respuesta esperada:

```json
{
  "id": 1,
  "nombre": "Gloss rosado",
  "precio": 14000.00,
  "descripcion": "Gloss rosado hidratante para labios.",
  "slug": "gloss-rosado",
  "activo": true,
  "marca": "Marca demo",
  "categorias": [
    {
      "id": 1,
      "nombre": "Maquillaje",
      "slug": "maquillaje"
    }
  ]
}
```

---

## Datos manuales de prueba

Insertar categoría:

```sql
INSERT INTO categoria (nombre, slug)
VALUES ('Maquillaje', 'maquillaje')
ON CONFLICT (slug) DO NOTHING;
```

Insertar usuario admin temporal:

```sql
INSERT INTO usuario_admin (email, nombre, pass_hash)
VALUES ('admin@gabriela.com', 'Gabriela', 'placeholder_hash')
ON CONFLICT (email) DO NOTHING;
```

Insertar producto:

```sql
INSERT INTO producto (
    nombre_producto,
    precio,
    descripcion,
    slug,
    activo,
    marca,
    creado_por,
    actualizado_por
)
VALUES (
    'Gloss rosado',
    14000.00,
    'Gloss rosado hidratante para labios.',
    'gloss-rosado',
    true,
    'Marca demo',
    1,
    1
)
ON CONFLICT (slug) DO NOTHING;
```

Asociar producto con categoría:

```sql
INSERT INTO producto_categoria (id_producto, id_categoria)
SELECT p.id_producto, c.id_categoria
FROM producto p, categoria c
WHERE p.slug = 'gloss-rosado'
  AND c.slug = 'maquillaje'
ON CONFLICT (id_producto, id_categoria) DO NOTHING;
```

---

## Seguridad actual

Spring Security está instalado.

Actualmente se usa una configuración temporal para permitir endpoints públicos como:

```text
/api/categories/**
/api/products/**
```

Spring puede generar una contraseña temporal en consola mientras no exista una configuración de autenticación definitiva.

Pendiente:

```text
- Login admin
- JWT
- Protección de endpoints /api/admin/**
- Gestión real de usuarios admin
```

---

## Estado actual del backend

Implementado:

```text
[OK] Proyecto Spring Boot
[OK] PostgreSQL local con Docker Compose
[OK] Variables de entorno locales
[OK] Flyway con migración inicial
[OK] Entidades JPA
[OK] Repositories
[OK] Endpoint público de categorías
[OK] Endpoint público de productos
[OK] Filtro por categoría
[OK] Detalle de producto con categorías
```

Pendiente:

```text
[ ] Manejo global de errores
[ ] DTOs de error
[ ] Endpoints admin para crear/editar/desactivar productos
[ ] Autenticación real
[ ] JWT
[ ] Subida de imágenes
[ ] Integración con Cloudinary o Supabase Storage
[ ] Tests
[ ] Deploy
```

---

## Próximo paso recomendado

Implementar manejo global de errores:

```text
common/exception/NotFoundException.java
common/exception/BadRequestException.java
common/exception/GlobalExceptionHandler.java
common/web/ApiError.java
```

Objetivo:

```text
GET /api/products/no-existe
```

Debe responder con un `404 Not Found` limpio en JSON, no con una excepción genérica.