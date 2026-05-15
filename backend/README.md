# Backend - Tienda

Backend REST para una tienda de productos de belleza, maquillaje, cuidado capilar e higiene personal.

El backend permite consultar productos/categorías públicamente y, de momento, crear productos desde un endpoint administrativo temporal.

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

## Ejecución local

### 1. Crear variables de entorno

Copiar `.env.example` a `.env` dentro de `backend/` y completar los valores locales.

Ejemplo de variables requeridas:

```env
POSTGRES_DB=beauty_store
POSTGRES_USER=beauty_user
POSTGRES_PASSWORD=change_me
POSTGRES_PORT=5433

DB_URL=jdbc:postgresql://127.0.0.1:5433/beauty_store
DB_USERNAME=beauty_user
DB_PASSWORD=change_me
```

El archivo `.env` real no debe subirse al repositorio.

---

### 2. Levantar PostgreSQL

Desde `backend/`:

```bash
docker compose up -d
```

Verificar:

```bash
docker compose ps
```

---

### 3. Ejecutar backend

Desde IntelliJ o con Maven Wrapper:

```bash
./mvnw spring-boot:run
```

En Windows:

```bash
mvnw.cmd spring-boot:run
```

Base URL local:

```text
http://localhost:8080
```

---

## Base de datos

La base de datos se versiona con Flyway.

Migración actual:

```text
src/main/resources/db/migration/V1__init_schema.sql
```

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

Hibernate está configurado con:

```properties
spring.jpa.hibernate.ddl-auto=validate
```

Por tanto, Hibernate no crea ni modifica tablas; solo valida que las entidades coincidan con el esquema creado por Flyway.

---

## Endpoints disponibles

## 1. Listar categorías

```http
GET /api/categories
```

### Respuesta esperada

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

## 2. Listar productos activos

```http
GET /api/products
```

### Respuesta esperada

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

## 3. Filtrar productos por categoría

```http
GET /api/products?category=maquillaje
```

El parámetro `category` recibe el `slug` de la categoría.

### Respuesta esperada

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

## 4. Consultar detalle de producto por slug

```http
GET /api/products/{slug}
```

Ejemplo:

```http
GET /api/products/gloss-rosado
```

### Respuesta esperada

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

### Si el producto no existe

```http
GET /api/products/no-existe
```

Respuesta esperada:

```json
{
  "timestamp": "2026-05-13T...",
  "status": 404,
  "error": "Not Found",
  "message": "Producto no encontrado: no-existe",
  "path": "/api/products/no-existe"
}
```

---

## 5. Crear producto

Endpoint administrativo temporal.

```http
POST /api/admin/products
Content-Type: application/json
```

### Cuerpo JSON

```json
{
  "nombre": "Labial negro",
  "precio": 8000,
  "descripcion": "Lapiz labial de tono negro.",
  "marca": "Marca labis",
  "categoriaIds": [1, 4, 6]
}
```

### Respuesta esperada

```json
{
  "id": 2,
  "nombre": "Labial negro",
  "precio": 8000,
  "descripcion": "Lapiz labial de tono negro.",
  "slug": "labial-negro",
  "activo": true,
  "marca": "Marca labis",
  "categorias": [
    {
      "id": 1,
      "nombre": "Maquillaje",
      "slug": "maquillaje"
    },
    {
      "id": 4,
      "nombre": "Labios",
      "slug": "labios"
    },
    {
      "id": 6,
      "nombre": "Ofertas",
      "slug": "ofertas"
    }
  ]
}
```

Este endpoint también:

- genera automáticamente el `slug`;
- valida que las categorías existan;
- guarda relaciones en `producto_categoria`;
- registra auditoría en `producto_audit_log`.

---

## Seguridad actual

Spring Security está instalado.

Actualmente, por desarrollo local, están permitidos temporalmente:

```text
/api/categories/**
/api/products/**
/api/admin/products
```

Pendiente para producción:

```text
- Login admin
- JWT
- Protección real de /api/admin/**
- Gestión segura de usuarios administradores
```

---

## Estado actual

Implementado:

```text
[OK] PostgreSQL local con Docker Compose
[OK] Migraciones con Flyway
[OK] Entidades JPA
[OK] Repositories
[OK] Endpoints públicos de categorías
[OK] Endpoints públicos de productos
[OK] Filtro por categoría
[OK] Detalle de producto con categorías
[OK] Manejo global de errores
[OK] Creación de productos desde endpoint admin temporal
[OK] Auditoría básica de creación de productos
```

Pendiente:

```text
[ ] Editar productos
[ ] Activar/desactivar productos
[ ] Subida de imágenes
[ ] Autenticación real
[ ] JWT
[ ] Tests
[ ] Deploy
```