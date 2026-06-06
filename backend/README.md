# Backend - Tienda Gabriela

Backend REST para una tienda de productos de belleza, maquillaje, cuidado capilar e higiene personal.

Este backend cubre catálogo público, administración de productos, categorías, usuarios administradores, imágenes con Cloudinary, autenticación de administradores con JWT y auditoría básica de acciones administrativas.

---

## Estado funcional actual

Implementado:

```text
[OK] PostgreSQL local con Docker Compose
[OK] Migraciones con Flyway
[OK] Entidades JPA
[OK] Repositories con Spring Data JPA
[OK] DTOs de entrada y salida
[OK] Manejo global de errores
[OK] Listar categorías públicas
[OK] Gestión admin de categorías
[OK] Listar productos activos
[OK] Filtrar productos por categoría
[OK] Consultar detalle de producto por slug
[OK] Imagen principal en listado público
[OK] Lista de imágenes en detalle de producto
[OK] Crear productos
[OK] Editar productos
[OK] Activar/desactivar productos
[OK] Agregar imágenes por URL
[OK] Subir imágenes reales a Cloudinary usando multipart/form-data
[OK] Eliminar imágenes de PostgreSQL y Cloudinary
[OK] Marcar imagen principal
[OK] Reordenamiento de imágenes: la principal queda con orden 0
[OK] Validaciones de orden, tipo y tamaño de imagen
[OK] Login admin con JWT
[OK] Protección de endpoints /api/admin/**
[OK] Auditoría usando el admin autenticado por JWT
[OK] Gestión básica de usuarios admin desde API protegida
```

Pendiente:

```text
[ ] CORS definitivo para frontend
[ ] Tests automatizados
[ ] Configuración final de deploy
[ ] Endurecimiento adicional de seguridad para producción
```

---

## Stack técnico

```text
Java 17
Spring Boot 3.5.x
Maven
Spring Web
Spring Data JPA
Spring Security
OAuth2 Resource Server para JWT
PostgreSQL
Flyway
Lombok
Docker Compose
Cloudinary
```

---

## Arquitectura

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

Para subida de imágenes:

```text
Cliente / Postman
        ↓ multipart/form-data
Spring Boot
        ↓ validación de archivo
Cloudinary
        ↓ public_id + secure_url
PostgreSQL
        ↓ guarda metadata
Respuesta JSON
```

Para endpoints admin protegidos:

```text
POST /api/auth/login
        ↓
JWT
        ↓
Authorization: Bearer <token>
        ↓
/api/admin/**
```

Responsabilidades:

```text
Controller:
- Expone endpoints HTTP.
- Recibe JSON o multipart/form-data.
- Valida DTOs con @Valid.
- Devuelve respuestas JSON.

Service:
- Contiene lógica de negocio.
- Valida productos, categorías, imágenes y usuario autenticado.
- Genera slugs.
- Crea, actualiza, activa y desactiva productos.
- Administra categorías.
- Administra usuarios administradores.
- Administra imágenes.
- Sube y elimina archivos en Cloudinary.
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

Spring Security:
- Valida JWT.
- Protege /api/admin/**.
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

Reglas importantes de imágenes:

```text
- Un producto puede tener varias imágenes.
- Solo una imagen por producto debe tener principal = true.
- La imagen principal debe tener orden = 0.
- Las imágenes secundarias deben tener orden >= 1.
- No puede repetirse el mismo orden para el mismo producto.
```

Reglas importantes de administradores:

```text
- Los administradores inician sesión mediante POST /api/auth/login.
- Los endpoints /api/admin/** requieren JWT.
- El rol actual implementado es ADMIN mediante enum AdminRole.
- Las contraseñas se guardan como pass_hash con BCrypt.
- Nunca se devuelve passHash en respuestas HTTP.
```

---

# Ejecución local

## 1. Variables de entorno

Crear `backend/.env` usando como base `backend/.env.example`.

Ejemplo de variables requeridas:

```env
POSTGRES_DB=beauty_store
POSTGRES_USER=beauty_user
POSTGRES_PASSWORD=change_me
POSTGRES_PORT=5433

DB_URL=jdbc:postgresql://127.0.0.1:5433/beauty_store
DB_USERNAME=beauty_user
DB_PASSWORD=change_me

CLOUDINARY_CLOUD_NAME=change_me
CLOUDINARY_API_KEY=change_me
CLOUDINARY_API_SECRET=change_me

JWT_SECRET=change_me_with_at_least_32_chars
JWT_EXPIRES_MINUTES=480
```

Si se configuró carpeta dinámica de Cloudinary:

```env
CLOUDINARY_PRODUCT_IMAGES_FOLDER=gabriela-store/dev/products
```

El archivo `.env` real no debe subirse al repositorio.

Verificar:

```bash
git check-ignore -v backend/.env
```

Debe mostrar que `backend/.env` está ignorado.

> Nota: IntelliJ no necesariamente carga `backend/.env` automáticamente. En desarrollo local, las variables usadas por Spring Boot deben configurarse también en `Run -> Edit Configurations -> Environment variables`, salvo que se use un plugin o mecanismo explícito para cargar `.env`.

---

## 2. Levantar PostgreSQL

Desde `backend/`:

```bash
docker compose up -d
```

Verificar:

```bash
docker compose ps
docker compose config
```

---

## 3. Ejecutar backend

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

`application.properties` usa variables de entorno. Ejemplo conceptual:

```properties
spring.application.name=store

spring.datasource.url=${DB_URL}
spring.datasource.username=${DB_USERNAME}
spring.datasource.password=${DB_PASSWORD}

spring.jpa.hibernate.ddl-auto=validate
spring.jpa.show-sql=true
spring.jpa.open-in-view=false

spring.flyway.enabled=true

spring.servlet.multipart.max-file-size=5MB
spring.servlet.multipart.max-request-size=6MB

app.jwt.secret=${JWT_SECRET}
app.jwt.expires-minutes=${JWT_EXPIRES_MINUTES:480}

app.cloudinary.product-images-folder=gabriela-store/dev/products
```

Puntos clave:

```text
spring.jpa.hibernate.ddl-auto=validate
```

Hibernate no crea ni modifica tablas. Solo valida que las entidades Java coincidan con el esquema creado por Flyway.

```text
JWT_SECRET
```

Debe ser secreto, largo y aleatorio. No debe estar en GitHub ni en el frontend.

---

# Seguridad actual

## Endpoints públicos

```text
GET /api/categories/**
GET /api/products/**
POST /api/auth/login
```

## Endpoints protegidos

```text
/api/admin/**
```

Requieren:

```http
Authorization: Bearer <accessToken>
```

El token se obtiene con:

```http
POST /api/auth/login
```

---

# Generación de contraseña admin con BCrypt

Los administradores no deben guardar contraseñas en texto plano. La columna correcta es:

```text
usuario_admin.pass_hash
```

Para desarrollo se está usando una clase temporal llamada `GeneratePasswordHash.java` para generar hashes BCrypt.

Ubicación sugerida:

```text
backend/src/test/java/com/gabriela/store/dev/GeneratePasswordHash.java
```

Ejemplo:

```java
package com.gabriela.store.dev;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class GeneratePasswordHash {

    public static void main(String[] args) {
        System.out.println(new BCryptPasswordEncoder().encode("admin123"));
    }
}
```

Uso:

```text
1. Cambiar "admin123" por la contraseña temporal deseada.
2. Ejecutar GeneratePasswordHash.main().
3. Copiar el hash generado.
4. Insertar o actualizar usuario_admin.pass_hash.
5. No subir GeneratePasswordHash.java al repositorio.
```

Cada ejecución genera un hash diferente. Eso es normal porque BCrypt usa salt aleatorio.

Después de implementar `POST /api/admin/users`, esta clase queda principalmente para bootstrap del primer admin o mantenimiento local excepcional.

---

# Crear o actualizar el primer administrador por SQL

El primer administrador puede crearse manualmente por SQL porque todavía no existe un usuario autenticado que pueda crear otros usuarios.

## Crear admin inicial

```sql
INSERT INTO usuario_admin (
    email,
    nombre,
    pass_hash,
    rol,
    activo
)
VALUES (
    'admin@gabriela.com',
    'Gabriela',
    '<HASH_BCRYPT_GENERADO>',
    'ADMIN',
    true
)
ON CONFLICT (email) DO NOTHING;
```

## Actualizar contraseña de un admin

```sql
UPDATE usuario_admin
SET pass_hash = '<HASH_BCRYPT_GENERADO>'
WHERE email = 'admin@gabriela.com';
```

## Verificar admins

```sql
SELECT
    id_usuario,
    email,
    nombre,
    rol,
    activo,
    fecha_creacion,
    fecha_ultima_actualizacion
FROM usuario_admin
ORDER BY id_usuario;
```

Resultado esperado:

```text
Debe mostrar administradores con rol ADMIN.
pass_hash debe empezar normalmente por $2a$, $2b$ o $2y$.
```

---

# Cómo saber qué IDs o slugs usar

## Obtener IDs de productos

```sql
SELECT id_producto, nombre_producto, slug, activo
FROM producto
ORDER BY id_producto;
```

Usa:

```text
id_producto -> para endpoints con {id}
slug        -> para GET /api/products/{slug}
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
id_categoria -> para categoriaIds en POST/PUT de producto y endpoints admin de categoría
slug         -> para filtrar productos por categoría
```

---

## Obtener IDs de imágenes

```sql
SELECT id_imagen, id_producto, public_id, url, orden, principal, alt_text
FROM imagen_producto
ORDER BY id_producto, orden;
```

Usa:

```text
id_imagen   -> para endpoints con {imageId}
id_producto -> para endpoints con {id}
public_id   -> identificador de Cloudinary usado para eliminar assets
```

---

## Obtener IDs de usuarios admin

```sql
SELECT id_usuario, email, nombre, rol, activo
FROM usuario_admin
ORDER BY id_usuario;
```

Usa:

```text
id_usuario -> para activar/desactivar usuarios admin
```

---

# Pruebas en Postman

Base URL:

```text
http://localhost:8080
```

---

## 1. Login admin

### Request

```http
POST /api/auth/login
Content-Type: application/json
```

### Body

```json
{
  "email": "admin@gabriela.com",
  "password": "admin123"
}
```

### Respuesta esperada

```json
{
  "accessToken": "eyJ...",
  "tokenType": "Bearer",
  "expiresInSeconds": 28800
}
```

Si `JWT_EXPIRES_MINUTES=480`, entonces:

```text
480 * 60 = 28800 segundos
```

### Cómo usar el token en Postman

En endpoints `/api/admin/**`:

```text
Authorization -> Type: Bearer Token
Token -> pegar accessToken sin escribir la palabra Bearer
```

Sin token, los endpoints admin deben responder `401 Unauthorized` o `403 Forbidden`.

---

## 2. Listar categorías públicas

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

## 3. Gestión admin de categorías

Todos estos endpoints requieren Bearer Token.

### 3.1. Listar categorías admin

```http
GET /api/admin/categories
Authorization: Bearer <token>
```

Respuesta esperada:

```json
[
  {
    "id": 1,
    "nombre": "Maquillaje",
    "slug": "maquillaje"
  },
  {
    "id": 2,
    "nombre": "Cuidado facial",
    "slug": "cuidado-facial"
  }
]
```

### 3.2. Crear categoría

```http
POST /api/admin/categories
Authorization: Bearer <token>
Content-Type: application/json
```

Body:

```json
{
  "nombre": "Cuidado facial"
}
```

Respuesta esperada:

```json
{
  "id": 7,
  "nombre": "Cuidado facial",
  "slug": "cuidado-facial"
}
```

Efectos esperados:

```text
- Inserta una nueva categoría.
- Genera slug automáticamente.
- Rechaza nombres duplicados.
```

### 3.3. Editar categoría

```http
PUT /api/admin/categories/{id}
Authorization: Bearer <token>
Content-Type: application/json
```

Ejemplo:

```http
PUT /api/admin/categories/7
```

Body:

```json
{
  "nombre": "Cuidado de la piel"
}
```

Respuesta esperada:

```json
{
  "id": 7,
  "nombre": "Cuidado de la piel",
  "slug": "cuidado-de-la-piel"
}
```

Efectos esperados:

```text
- Actualiza nombre.
- Regenera slug.
- Rechaza duplicados.
```

### 3.4. Eliminar categoría

```http
DELETE /api/admin/categories/{id}
Authorization: Bearer <token>
```

Ejemplo:

```http
DELETE /api/admin/categories/7
```

Respuesta esperada:

```http
204 No Content
```

Efectos esperados:

```text
- Elimina la categoría.
- Si existen relaciones en producto_categoria con ON DELETE CASCADE, se eliminan esas relaciones.
- No elimina productos.
```

---

## 4. Listar productos activos

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
    "imagenPrincipalUrl": "https://res.cloudinary.com/..."
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

## 5. Filtrar productos por categoría

### Request

```http
GET /api/products?category=maquillaje
```

`category` debe ser el `slug` de la categoría, no el ID.

---

## 6. Consultar detalle de producto por slug

### Request

```http
GET /api/products/{slug}
```

Ejemplo:

```http
GET /api/products/labial-negro-mate
```

Respuesta esperada:

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
      "id": 10,
      "url": "https://res.cloudinary.com/...",
      "orden": 0,
      "principal": true,
      "altText": "Labial negro mate"
    }
  ]
}
```

---

## 7. Crear producto

Endpoint protegido. Requiere Bearer Token.

### Request

```http
POST /api/admin/products
Authorization: Bearer <token>
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
- Registra auditoría CREATED con el admin autenticado.
```

---

## 8. Editar producto

Endpoint protegido. Requiere Bearer Token.

### Request

```http
PUT /api/admin/products/{id}
Authorization: Bearer <token>
Content-Type: application/json
```

Body:

```json
{
  "nombre": "Labial negro mate",
  "precio": 9500,
  "descripcion": "Lapiz labial negro con acabado mate.",
  "marca": "Marca labis",
  "categoriaIds": [1, 4]
}
```

---

## 9. Desactivar producto

```http
PATCH /api/admin/products/{id}/deactivate
Authorization: Bearer <token>
```

Efectos esperados:

```text
- producto.activo pasa a false.
- El producto no aparece en GET /api/products.
- GET /api/products/{slug} devuelve 404 mientras esté inactivo.
- Registra auditoría DEACTIVATED con el admin autenticado.
```

---

## 10. Reactivar producto

```http
PATCH /api/admin/products/{id}/activate
Authorization: Bearer <token>
```

---

## 11. Agregar imagen por URL

Endpoint protegido. Requiere Bearer Token.

### Request

```http
POST /api/admin/products/{id}/images
Authorization: Bearer <token>
Content-Type: application/json
```

Body:

```json
{
  "url": "https://res.cloudinary.com/demo/image/upload/sample.jpg",
  "publicId": "demo/labial-negro-mate",
  "orden": 1,
  "principal": false,
  "altText": "Labial negro mate"
}
```

---

## 12. Subir imagen real a Cloudinary

Endpoint protegido. Requiere Bearer Token.

### Request

```http
POST /api/admin/products/{id}/images/upload
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

En Postman:

```text
Body -> form-data
```

Campos:

```text
KEY          TYPE    VALUE
file         File    seleccionar imagen JPG/PNG/WEBP
principal    Text    false
altText      Text    Vista secundaria del producto
```

Campo opcional:

```text
orden        Text    2
```

Recomendación:

```text
- Para imagen secundaria: principal=false y no enviar orden, salvo que se quiera una posición explícita.
- Para imagen principal: principal=true y no enviar orden.
```

---

## 13. Marcar imagen como principal

```http
PATCH /api/admin/products/{id}/images/{imageId}/main
Authorization: Bearer <token>
```

Efectos esperados:

```text
- La imagen indicada queda como principal.
- La imagen principal queda con orden=0.
- Las demás imágenes quedan principal=false y orden>=1.
- Registra auditoría MAIN_IMAGE_CHANGED con el admin autenticado.
```

---

## 14. Eliminar imagen

```http
DELETE /api/admin/products/{id}/images/{imageId}
Authorization: Bearer <token>
```

Respuesta esperada:

```http
204 No Content
```

Efectos esperados:

```text
- Elimina la imagen de imagen_producto.
- Si tiene public_id de Cloudinary, elimina el asset real de Cloudinary.
- Si era la principal y quedan imágenes, promueve/reordena otra imagen.
- Registra auditoría IMAGE_DELETED con el admin autenticado.
```

---

## 15. Gestión admin de usuarios

Todos estos endpoints requieren Bearer Token.

### 15.1. Listar usuarios admin

```http
GET /api/admin/users
Authorization: Bearer <token>
```

Respuesta esperada:

```json
[
  {
    "id": 1,
    "email": "admin@gabriela.com",
    "nombre": "Gabriela",
    "rol": "ADMIN",
    "activo": true,
    "fechaCreacion": "2026-06-04T...",
    "fechaUltimaActualizacion": "2026-06-04T..."
  }
]
```

### 15.2. Crear usuario admin

```http
POST /api/admin/users
Authorization: Bearer <token>
Content-Type: application/json
```

Body:

```json
{
  "email": "empleado@gabriela.com",
  "nombre": "Empleado Tienda",
  "password": "Empleado123"
}
```

Respuesta esperada:

```json
{
  "id": 3,
  "email": "empleado@gabriela.com",
  "nombre": "Empleado Tienda",
  "rol": "ADMIN",
  "activo": true,
  "fechaCreacion": "2026-06-04T...",
  "fechaUltimaActualizacion": "2026-06-04T..."
}
```

Luego debe poder iniciar sesión:

```http
POST /api/auth/login
```

Body:

```json
{
  "email": "empleado@gabriela.com",
  "password": "Empleado123"
}
```

### 15.3. Desactivar usuario admin

```http
PATCH /api/admin/users/{id}/deactivate
Authorization: Bearer <token>
```

Efectos esperados:

```text
- usuario_admin.activo pasa a false.
- Ese usuario ya no puede hacer login.
```

### 15.4. Reactivar usuario admin

```http
PATCH /api/admin/users/{id}/activate
Authorization: Bearer <token>
```

Efectos esperados:

```text
- usuario_admin.activo pasa a true.
- Ese usuario puede volver a hacer login.
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

## 3. Verificar categorías

```sql
SELECT id_categoria, nombre, slug
FROM categoria
ORDER BY id_categoria;
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
Solo una imagen por producto debería tener principal = true.
La imagen principal debería tener orden = 0.
```

---

## 7. Verificar usuarios admin

```sql
SELECT
    id_usuario,
    email,
    nombre,
    rol,
    activo,
    fecha_creacion,
    fecha_ultima_actualizacion
FROM usuario_admin
ORDER BY id_usuario;
```

Verificar hash:

```sql
SELECT
    id_usuario,
    email,
    pass_hash
FROM usuario_admin
ORDER BY id_usuario;
```

Resultado esperado:

```text
pass_hash debe ser un hash BCrypt.
No debe guardar la contraseña en texto plano.
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

La columna ua.email debe corresponder al admin que hizo login.
```

---

# Errores esperados

## Credenciales inválidas

```json
{
  "timestamp": "2026-05-13T...",
  "status": 400,
  "error": "Bad Request",
  "message": "Credenciales inválidas.",
  "path": "/api/auth/login"
}
```

## Producto no encontrado

```json
{
  "timestamp": "2026-05-13T...",
  "status": 404,
  "error": "Not Found",
  "message": "Producto no encontrado con id: 999",
  "path": "/api/admin/products/999"
}
```

## Categoría duplicada

```json
{
  "timestamp": "2026-05-13T...",
  "status": 400,
  "error": "Bad Request",
  "message": "Ya existe una categoría con ese nombre.",
  "path": "/api/admin/categories"
}
```

## Imagen secundaria con orden 0

```json
{
  "timestamp": "2026-05-13T...",
  "status": 400,
  "error": "Bad Request",
  "message": "El orden de una imagen secundaria debe ser mayor o igual a 1. La imagen principal siempre usa orden 0.",
  "path": "/api/admin/products/2/images/upload"
}
```

## Orden duplicado

```json
{
  "timestamp": "2026-05-13T...",
  "status": 400,
  "error": "Bad Request",
  "message": "Ya existe una imagen con orden 1 para el producto 2.",
  "path": "/api/admin/products/2/images/upload"
}
```

## Archivo demasiado grande

```json
{
  "timestamp": "2026-05-13T...",
  "status": 413,
  "error": "Payload Too Large",
  "message": "La imagen supera el tamaño máximo permitido.",
  "path": "/api/admin/products/2/images/upload"
}
```

---

# Notas de seguridad

```text
- No subir backend/.env.
- No subir CLOUDINARY_API_SECRET.
- No subir JWT_SECRET.
- No poner secretos en README.
- No poner JWT_SECRET en frontend.
- No poner CLOUDINARY_API_SECRET en frontend.
- No dejar endpoints /api/admin/** abiertos.
- No crear un endpoint público de registro de admins.
- El primer admin se puede crear por SQL; los siguientes deben crearse desde /api/admin/users.
```

---

# Pendientes inmediatos

```text
[ ] CORS para frontend
[ ] Tests automatizados mínimos
[ ] Preparación de deploy
```
