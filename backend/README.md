# Backend - Tienda

Backend REST para una tienda de productos de belleza, maquillaje, cuidado capilar e higiene personal.

El backend permite consultar productos y categorías públicamente, y administrar productos temporalmente mediante endpoints abiertos para desarrollo local.

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

## Arquitectura actual

Flujo general de una petición:

```text
Cliente HTTP / Postman / Frontend
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

Responsabilidades principales:

```text
Controller
- Expone endpoints HTTP.
- Recibe JSON.
- Valida DTOs con @Valid.
- Devuelve respuestas JSON.

Service
- Contiene la lógica de negocio.
- Valida existencia de productos/categorías.
- Genera slugs.
- Crea, actualiza, activa y desactiva productos.
- Registra auditoría.

Repository
- Accede a la base de datos usando Spring Data JPA.

DTOs
- Definen los datos de entrada y salida de la API.
- Evitan exponer directamente entidades JPA.

Flyway
- Crea y versiona el esquema de base de datos.

Hibernate
- Valida que las entidades coincidan con las tablas.
```

---

## Modelo de datos principal

Tablas actuales:

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

La relación muchos a muchos entre productos y categorías se resuelve mediante:

```text
producto_categoria
```

---

## Ejecución local

### 1. Variables de entorno

Crear un archivo `.env` dentro de `backend/` usando como base `.env.example`.

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

El archivo `.env` real no debe subirse al repositorio.

---

### 2. Levantar PostgreSQL

Desde `backend/`:

```bash
docker compose up -d
```

Verificar contenedor:

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

## Configuración importante

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

Punto clave:

```text
spring.jpa.hibernate.ddl-auto=validate
```

Hibernate no crea ni modifica tablas. Solo valida que las entidades Java coincidan con el esquema creado por Flyway.

---

## Seguridad actual

Spring Security está instalado.

Durante desarrollo local, temporalmente están permitidos:

```text
/api/categories/**
/api/products/**
/api/admin/products/**
```

Esto no es configuración final de producción.

Pendiente:

```text
- Login admin
- JWT
- Protección real de /api/admin/**
- Gestión segura de usuarios administradores
```

---

# Pruebas en Postman

Base URL:

```text
http://localhost:8080
```

---

## 1. Listar categorías

### Request

```http
GET /api/categories
```

### Body

No requiere body.

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

### Request

```http
GET /api/products
```

### Body

No requiere body.

### Respuesta esperada

```json
[
  {
    "id": 2,
    "nombre": "Labial negro mate",
    "precio": 9500.00,
    "descripcion": "Lapiz labial negro con acabado mate.",
    "slug": "labial-negro-mate",
    "activo": true,
    "marca": "Marca labis",
    "imagenPrincipalUrl": "https://res.cloudinary.com/demo/image/upload/sample.jpg"
  }
]
```

Notas:

- Solo devuelve productos activos.
- Solo incluye la imagen principal del producto.
- `imagenPrincipalUrl` puede venir en `null` si el producto no tiene imagen principal registrada.

---

## 3. Filtrar productos por categoría

### Request

```http
GET /api/products?category=maquillaje
```

El parámetro `category` recibe el `slug` de la categoría.

### Body

No requiere body.

### Respuesta esperada

```json
[
  {
    "id": 2,
    "nombre": "Labial negro mate",
    "precio": 9500.00,
    "descripcion": "Lapiz labial negro con acabado mate.",
    "slug": "labial-negro-mate",
    "activo": true,
    "marca": "Marca labis",
    "imagenPrincipalUrl": "https://res.cloudinary.com/demo/image/upload/sample.jpg"
  }
]
```

---

## 4. Consultar detalle de producto por slug

### Request

```http
GET /api/products/{slug}
```

Ejemplo:

```http
GET /api/products/labial-negro-mate
```

### Body

No requiere body.

### Respuesta esperada

```json
{
  "id": 2,
  "nombre": "Labial negro mate",
  "precio": 9500.00,
  "descripcion": "Lapiz labial negro con acabado mate.",
  "slug": "labial-negro-mate",
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
    }
  ],
  "imagenes": [
    {
      "id": 1,
      "url": "https://res.cloudinary.com/demo/image/upload/sample.jpg",
      "orden": 0,
      "principal": true,
      "altText": "Labial negro mate"
    }
  ]
}
```

---

## 5. Consultar producto inexistente

### Request

```http
GET /api/products/no-existe
```

### Body

No requiere body.

### Respuesta esperada

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

## 6. Crear producto

Endpoint administrativo temporal.

### Request

```http
POST /api/admin/products
Content-Type: application/json
```

### Body

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
  "precio": 8000.00,
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
  ],
  "imagenes": []
}
```

Efectos esperados:

```text
- Inserta un registro en producto.
- Inserta relaciones en producto_categoria.
- Genera slug automáticamente.
- Registra auditoría CREATED en producto_audit_log.
```

---

## 7. Editar producto

Endpoint administrativo temporal.

### Request

```http
PUT /api/admin/products/{id}
Content-Type: application/json
```

Ejemplo:

```http
PUT /api/admin/products/2
```

### Body

```json
{
  "nombre": "Labial negro mate",
  "precio": 9500,
  "descripcion": "Lapiz labial negro con acabado mate.",
  "marca": "Marca labis",
  "categoriaIds": [1, 4]
}
```

### Respuesta esperada

```json
{
  "id": 2,
  "nombre": "Labial negro mate",
  "precio": 9500.00,
  "descripcion": "Lapiz labial negro con acabado mate.",
  "slug": "labial-negro-mate",
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
    }
  ],
  "imagenes": [
    {
      "id": 1,
      "url": "https://res.cloudinary.com/demo/image/upload/sample.jpg",
      "orden": 0,
      "principal": true,
      "altText": "Labial negro mate"
    }
  ]
}
```

Efectos esperados:

```text
- Actualiza datos del producto.
- Reemplaza las categorías anteriores por las nuevas.
- Regenera slug si cambió el nombre.
- Registra auditoría UPDATED en producto_audit_log.
```

---

## 8. Desactivar producto

Endpoint administrativo temporal.

### Request

```http
PATCH /api/admin/products/{id}/deactivate
```

Ejemplo:

```http
PATCH /api/admin/products/2/deactivate
```

### Body

No requiere body.

### Respuesta esperada

```json
{
  "id": 2,
  "nombre": "Labial negro mate",
  "precio": 9500.00,
  "descripcion": "Lapiz labial negro con acabado mate.",
  "slug": "labial-negro-mate",
  "activo": false,
  "marca": "Marca labis",
  "categorias": [
    {
      "id": 1,
      "nombre": "Maquillaje",
      "slug": "maquillaje"
    }
  ],
  "imagenes": [
    {
      "id": 1,
      "url": "https://res.cloudinary.com/demo/image/upload/sample.jpg",
      "orden": 0,
      "principal": true,
      "altText": "Labial negro mate"
    }
  ]
}
```

Efectos esperados:

```text
- producto.activo pasa a false.
- El producto deja de aparecer en GET /api/products.
- GET /api/products/{slug} debe devolver 404 mientras esté inactivo.
- Registra auditoría DEACTIVATED.
```

---

## 9. Reactivar producto

Endpoint administrativo temporal.

### Request

```http
PATCH /api/admin/products/{id}/activate
```

Ejemplo:

```http
PATCH /api/admin/products/2/activate
```

### Body

No requiere body.

### Respuesta esperada

```json
{
  "id": 2,
  "nombre": "Labial negro mate",
  "precio": 9500.00,
  "descripcion": "Lapiz labial negro con acabado mate.",
  "slug": "labial-negro-mate",
  "activo": true,
  "marca": "Marca labis",
  "categorias": [
    {
      "id": 1,
      "nombre": "Maquillaje",
      "slug": "maquillaje"
    }
  ],
  "imagenes": [
    {
      "id": 1,
      "url": "https://res.cloudinary.com/demo/image/upload/sample.jpg",
      "orden": 0,
      "principal": true,
      "altText": "Labial negro mate"
    }
  ]
}
```

Efectos esperados:

```text
- producto.activo pasa a true.
- El producto vuelve a aparecer en GET /api/products.
- Registra auditoría REACTIVATED.
```

---

# Pruebas SQL recomendadas

Estas pruebas se pueden ejecutar desde DBeaver o psql.

---

## 1. Verificar tablas creadas por Flyway

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

### Resultado esperado

Debe incluir:

```text
categoria
flyway_schema_history
imagen_producto
producto
producto_audit_log
producto_categoria
usuario_admin
```

---

## 2. Verificar migraciones ejecutadas

```sql
SELECT *
FROM flyway_schema_history
ORDER BY installed_rank;
```

### Resultado esperado

Debe existir al menos la migración inicial:

```text
V1__init_schema.sql
success = true
```

---

## 3. Insertar datos base para pruebas

### Insertar admin temporal

```sql
INSERT INTO usuario_admin (email, nombre, pass_hash)
VALUES ('admin@gabriela.com', 'Gabriela', 'placeholder_hash')
ON CONFLICT (email) DO NOTHING;
```

### Insertar categorías

```sql
INSERT INTO categoria (nombre, slug)
VALUES
('Maquillaje', 'maquillaje'),
('Cabello', 'cabello'),
('Higiene personal', 'higiene-personal'),
('Labios', 'labios'),
('Perfumes', 'perfumes'),
('Ofertas', 'ofertas')
ON CONFLICT (slug) DO NOTHING;
```

### Verificar categorías

```sql
SELECT id_categoria, nombre, slug
FROM categoria
ORDER BY id_categoria;
```

### Resultado esperado

```text
Debe mostrar las categorías insertadas con sus IDs.
```

---

## 4. Verificar productos creados desde Postman

```sql
SELECT
    id_producto,
    nombre_producto,
    precio,
    slug,
    activo,
    marca,
    creado_por,
    actualizado_por,
    fecha_creacion,
    fecha_ultima_actualizacion
FROM producto
ORDER BY id_producto;
```

### Resultado esperado

Después de crear o editar productos desde Postman, deben aparecer registros como:

```text
id_producto = 2
nombre_producto = Labial negro mate
slug = labial-negro-mate
activo = true
```

---

## 5. Verificar relación producto-categoría

```sql
SELECT
    pc.id_producto_categoria,
    p.id_producto,
    p.nombre_producto,
    c.id_categoria,
    c.nombre AS categoria
FROM producto_categoria pc
JOIN producto p ON p.id_producto = pc.id_producto
JOIN categoria c ON c.id_categoria = pc.id_categoria
ORDER BY p.id_producto, c.id_categoria;
```

### Resultado esperado

Debe mostrar qué categorías tiene cada producto.

Ejemplo:

```text
Labial negro mate | Maquillaje
Labial negro mate | Labios
```

---

## 6. Insertar imagen manual de prueba

Mientras no exista subida real a Cloudinary, se puede insertar una URL manualmente:

```sql
INSERT INTO imagen_producto (
    id_producto,
    public_id,
    url,
    orden,
    principal,
    alt_text
)
VALUES (
    2,
    'demo/labial-negro-mate',
    'https://res.cloudinary.com/demo/image/upload/sample.jpg',
    0,
    true,
    'Labial negro mate'
);
```

### Verificar imágenes

```sql
SELECT
    id_imagen,
    id_producto,
    public_id,
    url,
    orden,
    principal,
    alt_text
FROM imagen_producto
ORDER BY id_producto, orden;
```

### Resultado esperado

Debe aparecer la imagen asociada al producto.

Luego:

```http
GET /api/products
```

debe incluir:

```
"imagenPrincipalUrl": "https://res.cloudinary.com/demo/image/upload/sample.jpg"
```

Y:

```http
GET /api/products/labial-negro-mate
```

debe incluir la lista:

```
"imagenes": [
  {
    "id": 1,
    "url": "https://res.cloudinary.com/demo/image/upload/sample.jpg",
    "orden": 0,
    "principal": true,
    "altText": "Labial negro mate"
  }
]
```

---

## 7. Verificar auditoría

```sql
SELECT
    pal.id_producto_audit_log,
    pal.id_producto,
    p.nombre_producto,
    pal.id_usuario,
    ua.email,
    pal.accion,
    pal.detalle,
    pal.fecha_evento
FROM producto_audit_log pal
JOIN producto p ON p.id_producto = pal.id_producto
JOIN usuario_admin ua ON ua.id_usuario = pal.id_usuario
ORDER BY pal.fecha_evento DESC;
```

### Resultado esperado

Debe mostrar acciones como:

```text
CREATED
UPDATED
DEACTIVATED
REACTIVATED
```

---

## 8. Verificar que productos desactivados no aparecen públicamente

### SQL

```sql
SELECT id_producto, nombre_producto, slug, activo
FROM producto
WHERE activo = false
ORDER BY id_producto;
```

### Resultado esperado

Debe listar productos desactivados.

### Postman

```http
GET /api/products
```

Resultado esperado:

```text
Los productos con activo = false no deben aparecer.
```

```http
GET /api/products/{slug}
```

Si el producto está inactivo, debe responder:

```json
{
  "timestamp": "2026-05-13T...",
  "status": 404,
  "error": "Not Found",
  "message": "Producto no encontrado: labial-negro-mate",
  "path": "/api/products/labial-negro-mate"
}
```

---

# Estado actual

Implementado:

```text
[OK] PostgreSQL local con Docker Compose
[OK] Migraciones con Flyway
[OK] Entidades JPA
[OK] Repositories
[OK] DTOs de entrada y salida
[OK] Manejo global de errores
[OK] Listar categorías
[OK] Listar productos activos
[OK] Filtrar productos por categoría
[OK] Consultar detalle de producto por slug
[OK] Incluir imagen principal en listado de productos
[OK] Incluir lista de imágenes en detalle de producto
[OK] Crear productos
[OK] Editar productos
[OK] Activar/desactivar productos
[OK] Auditoría básica de productos
```

Pendiente:

```text
[ ] Endpoint admin para agregar imágenes
[ ] Endpoint admin para eliminar imágenes
[ ] Endpoint admin para marcar imagen principal
[ ] Integración real con Cloudinary
[ ] Login admin
[ ] JWT
[ ] Protección real de /api/admin/**
[ ] Tests automatizados
[ ] Deploy
```