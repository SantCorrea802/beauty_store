# Backend - Tienda

Backend REST para una tienda de productos de belleza, maquillaje, cuidado capilar e higiene personal.

Actualmente permite:

```text
- Consultar categorías.
- Consultar productos activos.
- Filtrar productos por categoría.
- Consultar detalle de producto por slug.
- Crear productos.
- Editar productos.
- Activar/desactivar productos.
- Agregar imágenes por URL.
- Eliminar imágenes.
- Marcar una imagen como principal.
- Registrar auditoría básica de productos.
```

La subida real de archivos a Cloudinary todavía está pendiente. Por ahora las imágenes se registran mediante URL.

---

## Stack técnico

```text
Java 17
Spring Boot 3.5.x
Maven
Spring Web
Spring Data JPA
Spring Security
PostgreSQL
Flyway
Lombok
Docker Compose
```

---

## Arquitectura

Flujo general:

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

Responsabilidades:

```text
Controller:
- Expone endpoints HTTP.
- Recibe JSON.
- Valida DTOs con @Valid.
- Devuelve respuestas JSON.

Service:
- Contiene lógica de negocio.
- Valida productos, categorías e imágenes.
- Genera slugs.
- Crea, actualiza, activa y desactiva productos.
- Administra imágenes.
- Registra auditoría.

Repository:
- Accede a PostgreSQL mediante Spring Data JPA.

DTOs:
- Definen entradas y salidas de la API.
- Evitan exponer directamente entidades JPA.

Flyway:
- Crea y versiona el esquema de base de datos.

Hibernate:
- Valida que las entidades coincidan con el esquema.
```

---

## Modelo de datos principal

Tablas:

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

La relación muchos a muchos entre productos y categorías se maneja con:

```text
producto_categoria
```

---

## Ejecución local

### 1. Variables de entorno

Crear `backend/.env` usando como base `backend/.env.example`.

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

## Seguridad actual

Spring Security está instalado.

Durante desarrollo local están permitidos temporalmente:

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
```

---

# Cómo saber qué IDs o slugs usar

Antes de probar endpoints administrativos, puedes consultar estos datos en SQL.

## Obtener IDs de productos

```sql
SELECT id_producto, nombre_producto, slug, activo
FROM producto
ORDER BY id_producto;
```

Usa:

```text
id_producto → para endpoints con {id}
slug        → para GET /api/products/{slug}
```

Ejemplo:

```text
id_producto = 2
slug = labial-negro-mate
```

Entonces usarías:

```http
PUT /api/admin/products/2
GET /api/products/labial-negro-mate
```

---

## Obtener IDs de categorías

```sql
SELECT id_categoria, nombre, slug
FROM categoria
ORDER BY id_categoria;
```

Usa:

```text
id_categoria → para categoriaIds en POST/PUT de producto
slug         → para filtrar productos por categoría
```

Ejemplo:

```text
id_categoria = 1
slug = maquillaje
```

Entonces usarías:

```
"categoriaIds": [1]
```

y:

```http
GET /api/products?category=maquillaje
```

---

## Obtener IDs de imágenes

```sql
SELECT id_imagen, id_producto, url, orden, principal, alt_text
FROM imagen_producto
ORDER BY id_producto, orden;
```

Usa:

```text
id_imagen → para endpoints con {imageId}
id_producto → para endpoints con {id}
```

Ejemplo:

```text
id_producto = 2
id_imagen = 5
```

Entonces usarías:

```http
PATCH /api/admin/products/2/images/5/main
DELETE /api/admin/products/2/images/5
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

```text
- Solo aparecen productos activos.
- Solo se devuelve la imagen principal.
- imagenPrincipalUrl puede ser null si el producto no tiene imagen principal.
```

---

## 3. Filtrar productos por categoría

### Request

```http
GET /api/products?category=maquillaje
```

`category` debe ser el `slug` de la categoría, no el ID.

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

`{slug}` sale de la columna `producto.slug`.

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
      "id": 5,
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

`categoriaIds` debe contener IDs reales de la tabla `categoria`.

Para consultarlos:

```sql
SELECT id_categoria, nombre, slug
FROM categoria
ORDER BY id_categoria;
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
- Inserta en producto.
- Inserta relaciones en producto_categoria.
- Genera slug automáticamente.
- Registra auditoría CREATED.
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

`{id}` debe ser `producto.id_producto`.

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
  "imagenes": []
}
```

Efectos esperados:

```text
- Actualiza datos del producto.
- Reemplaza categorías anteriores.
- Regenera slug si cambió el nombre.
- Registra auditoría UPDATED.
```

---

## 8. Desactivar producto

### Request

```http
PATCH /api/admin/products/{id}/deactivate
```

Ejemplo:

```http
PATCH /api/admin/products/2/deactivate
```

`{id}` debe ser `producto.id_producto`.

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
  "imagenes": []
}
```

Efectos esperados:

```text
- producto.activo pasa a false.
- El producto no aparece en GET /api/products.
- GET /api/products/{slug} devuelve 404 mientras esté inactivo.
- Registra auditoría DEACTIVATED.
```

---

## 9. Reactivar producto

### Request

```http
PATCH /api/admin/products/{id}/activate
```

Ejemplo:

```http
PATCH /api/admin/products/2/activate
```

`{id}` debe ser `producto.id_producto`.

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
  "imagenes": []
}
```

Efectos esperados:

```text
- producto.activo pasa a true.
- El producto vuelve a aparecer en GET /api/products.
- Registra auditoría REACTIVATED.
```

---

## 10. Agregar imagen por URL

Endpoint administrativo temporal.

### Request

```http
POST /api/admin/products/{id}/images
Content-Type: application/json
```

Ejemplo:

```http
POST /api/admin/products/2/images
```

`{id}` debe ser `producto.id_producto`.

### Body

```json
{
  "url": "https://res.cloudinary.com/demo/image/upload/sample.jpg",
  "publicId": "demo/labial-negro-mate",
  "orden": 0,
  "principal": true,
  "altText": "Labial negro mate"
}
```

Notas:

```text
url:
- URL pública de la imagen.

publicId:
- Identificador externo de la imagen.
- Por ahora puede ser cualquier texto.
- Cuando se integre Cloudinary real, será el public_id devuelto por Cloudinary.

orden:
- Posición en el carrusel.
- 0 significa primera imagen.
- Si no se envía, el backend puede asignar el siguiente orden disponible.

principal:
- true si debe ser la imagen principal del producto.
- Si es la primera imagen del producto, el backend puede marcarla como principal automáticamente.

altText:
- Texto alternativo para accesibilidad y SEO.
```

### Respuesta esperada

```json
{
  "id": 5,
  "url": "https://res.cloudinary.com/demo/image/upload/sample.jpg",
  "orden": 0,
  "principal": true,
  "altText": "Labial negro mate"
}
```

Efectos esperados:

```text
- Inserta en imagen_producto.
- Si principal = true, las demás imágenes del mismo producto quedan con principal = false.
- Registra auditoría IMAGE_ADDED.
```

---

## 11. Marcar imagen como principal

### Request

```http
PATCH /api/admin/products/{id}/images/{imageId}/main
```

Ejemplo:

```http
PATCH /api/admin/products/2/images/5/main
```

Dónde:

```text
{id}      = producto.id_producto
{imageId} = imagen_producto.id_imagen
```

### Body

No requiere body.

### Respuesta esperada

```json
{
  "id": 5,
  "url": "https://res.cloudinary.com/demo/image/upload/sample.jpg",
  "orden": 0,
  "principal": true,
  "altText": "Labial negro mate"
}
```

Efectos esperados:

```text
- La imagen indicada queda como principal.
- Las demás imágenes del mismo producto quedan principal = false.
- Registra auditoría MAIN_IMAGE_CHANGED.
```

---

## 12. Eliminar imagen

### Request

```http
DELETE /api/admin/products/{id}/images/{imageId}
```

Ejemplo:

```http
DELETE /api/admin/products/2/images/5
```

Dónde:

```text
{id}      = producto.id_producto
{imageId} = imagen_producto.id_imagen
```

### Body

No requiere body.

### Respuesta esperada

```http
204 No Content
```

Efectos esperados:

```text
- Elimina la imagen de imagen_producto.
- Si era la imagen principal y quedan otras imágenes, el backend puede marcar otra como principal.
- Registra auditoría IMAGE_DELETED.
```

---

# Pruebas SQL recomendadas

## 1. Verificar tablas creadas por Flyway

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

Resultado esperado:

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

Resultado esperado:

```text
Debe existir V1__init_schema.sql con success = true.
```

---

## 3. Insertar datos base para pruebas

### Admin temporal

```sql
INSERT INTO usuario_admin (email, nombre, pass_hash)
VALUES ('admin@gabriela.com', 'Gabriela', 'placeholder_hash')
ON CONFLICT (email) DO NOTHING;
```

### Categorías

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

Resultado esperado:

```text
Debe mostrar las categorías con sus IDs.
Usa esos IDs en categoriaIds.
```

---

## 4. Verificar productos

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

Resultado esperado:

```text
Debe mostrar los productos creados o editados desde Postman.
Usa id_producto para endpoints administrativos.
Usa slug para endpoints públicos de detalle.
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

Resultado esperado:

```text
Debe mostrar las categorías asociadas a cada producto.
```

---

## 6. Verificar imágenes

```sql
SELECT
    id_imagen,
    id_producto,
    public_id,
    url,
    orden,
    principal,
    alt_text,
    fecha_creacion
FROM imagen_producto
ORDER BY id_producto, orden;
```

Resultado esperado:

```text
Debe mostrar las imágenes agregadas desde Postman.
id_imagen se usa como {imageId}.
id_producto se usa como {id}.
Solo una imagen por producto debería tener principal = true.
```

---

## 7. Verificar imagen principal de un producto

```sql
SELECT
    p.id_producto,
    p.nombre_producto,
    i.id_imagen,
    i.url,
    i.principal
FROM producto p
JOIN imagen_producto i ON i.id_producto = p.id_producto
WHERE p.id_producto = 2
  AND i.principal = true;
```

Cambia `2` por el `id_producto` real.

Resultado esperado:

```text
Debe devolver máximo una imagen principal para ese producto.
```

---

## 8. Verificar auditoría

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

Resultado esperado:

```text
Debe mostrar acciones como:

CREATED
UPDATED
DEACTIVATED
REACTIVATED
IMAGE_ADDED
IMAGE_DELETED
MAIN_IMAGE_CHANGED
```

---

## 9. Verificar productos desactivados

```sql
SELECT id_producto, nombre_producto, slug, activo
FROM producto
WHERE activo = false
ORDER BY id_producto;
```

Resultado esperado:

```text
Debe listar productos inactivos.
Esos productos no deben aparecer en GET /api/products.
GET /api/products/{slug} debe responder 404.
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
[OK] Agregar imágenes por URL
[OK] Eliminar imágenes
[OK] Marcar imagen principal
[OK] Auditoría básica de productos e imágenes
```

Pendiente:

```text
[ ] Crear cuenta de Cloudinary
[ ] Integración real con Cloudinary
[ ] Endpoint multipart/form-data para subir archivos
[ ] Login admin
[ ] JWT
[ ] Protección real de /api/admin/**
[ ] CORS definitivo para frontend
[ ] Tests automatizados
[ ] Deploy
```