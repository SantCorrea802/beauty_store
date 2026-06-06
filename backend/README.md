# Backend - Tienda Gabriela

Backend REST para una tienda de productos de belleza, maquillaje, cuidado capilar e higiene personal.

Este backend cubre catálogo público, administración de productos, imágenes con Cloudinary, autenticación de administradores con JWT, gestión básica de usuarios administradores y auditoría de acciones administrativas.

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
[OK] Listar productos activos
[OK] Filtrar productos por categoría
[OK] Consultar detalle de producto por slug
[OK] Imagen principal en listado público
[OK] Lista de imágenes en detalle de producto
[OK] Crear productos desde API admin
[OK] Editar productos desde API admin
[OK] Activar/desactivar productos desde API admin
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

Pendiente inmediato:

```text
[ ] Gestión admin de categorías desde API/panel:
    - GET /api/admin/categories
    - POST /api/admin/categories
    - PUT /api/admin/categories/{id}
    - DELETE /api/admin/categories/{id}

[ ] CORS definitivo para frontend
[ ] Tests automatizados
[ ] Configuración final de deploy
[ ] Endurecimiento de seguridad para producción
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

Flujo de subida de imágenes:

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

Flujo de autenticación admin:

```text
POST /api/auth/login
        ↓
Backend valida email + password BCrypt
        ↓
Backend emite JWT
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
- Administra imágenes.
- Sube y elimina archivos en Cloudinary.
- Administra usuarios admin.
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

Reglas importantes de usuarios admin:

```text
- Los admins tienen email único.
- La contraseña nunca se guarda en texto plano.
- usuario_admin.pass_hash guarda un hash BCrypt.
- El rol se maneja con enum AdminRole.
- Actualmente existe AdminRole.ADMIN.
- Los endpoints /api/admin/** requieren JWT con rol ADMIN.
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
GET  /api/categories/**
GET  /api/products/**
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

Para crear el primer admin o cambiar contraseñas manualmente en desarrollo, se usa una clase temporal local llamada `GeneratePasswordHash.java`.

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

Después de implementar `POST /api/admin/users`, este archivo queda principalmente para:

```text
- crear el primer admin inicial;
- reparar una contraseña localmente;
- pruebas manuales controladas.
```

Los nuevos admins deben crearse normalmente desde:

```http
POST /api/admin/users
```

---

# Crear o actualizar el primer admin por SQL

El primer admin inicial se puede crear manualmente por SQL porque todavía no existe una cuenta autenticada que pueda crear otras.

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
pass_hash debe empezar normalmente por $2a$, $2b$ o $2y$ si se consulta explícitamente.
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
id_categoria -> para categoriaIds en POST/PUT de producto
slug         -> para filtrar productos por categoría
```

Ejemplo:

```text
id_categoria = 1
slug = maquillaje
```

Entonces usarías:

```json
"categoriaIds": [1]
```

y:

```http
GET /api/products?category=maquillaje
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

## Obtener IDs de usuarios admin

```sql
SELECT
    id_usuario,
    email,
    nombre,
    rol,
    activo
FROM usuario_admin
ORDER BY id_usuario;
```

Usa:

```text
id_usuario -> para endpoints con {id} en /api/admin/users/{id}
email      -> para login
```

Ejemplo:

```text
id_usuario = 3
email = empleado@gabriela.com
```

Entonces usarías:

```http
PATCH /api/admin/users/3/deactivate
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

## 3. Listar productos activos

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

## 4. Filtrar productos por categoría

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
    "imagenPrincipalUrl": "https://res.cloudinary.com/..."
  }
]
```

---

## 5. Consultar detalle de producto por slug

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

## 6. Consultar producto inexistente

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

# Endpoints admin de productos

Todos requieren:

```http
Authorization: Bearer <token>
```

---

## 7. Crear producto

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
- Registra auditoría UPDATED con el admin autenticado.
```

---

## 9. Desactivar producto

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
  "categorias": [],
  "imagenes": []
}
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
  "categorias": [],
  "imagenes": []
}
```

Efectos esperados:

```text
- producto.activo pasa a true.
- El producto vuelve a aparecer en GET /api/products.
- Registra auditoría REACTIVATED con el admin autenticado.
```

---

# Endpoints admin de imágenes

Todos requieren:

```http
Authorization: Bearer <token>
```

---

## 11. Agregar imagen por URL

### Request

```http
POST /api/admin/products/{id}/images
Content-Type: application/json
```

Ejemplo:

```http
POST /api/admin/products/2/images
```

### Body

```json
{
  "url": "https://res.cloudinary.com/demo/image/upload/sample.jpg",
  "publicId": "demo/labial-negro-mate",
  "orden": 1,
  "principal": false,
  "altText": "Labial negro mate"
}
```

Notas:

```text
url:
- URL pública de la imagen.

publicId:
- Identificador externo de la imagen.
- Si la imagen no pertenece a tu Cloudinary, puede ser un valor de referencia.
- Para imágenes subidas por el backend, será el public_id devuelto por Cloudinary.

orden:
- Si principal=true, el backend debe forzar orden=0.
- Si principal=false, debe ser >= 1.
- Si se omite y la imagen es secundaria, el backend asigna el siguiente orden disponible.

principal:
- true si debe ser la imagen principal.
- false u omitido si debe ser secundaria.
- Si es la primera imagen del producto, el backend puede marcarla como principal automáticamente.

altText:
- Texto alternativo para accesibilidad y SEO.
```

### Respuesta esperada

```json
{
  "id": 5,
  "url": "https://res.cloudinary.com/demo/image/upload/sample.jpg",
  "orden": 1,
  "principal": false,
  "altText": "Labial negro mate"
}
```

Efectos esperados:

```text
- Inserta en imagen_producto.
- Si principal=true, la nueva imagen queda con orden=0.
- Las demás imágenes se reordenan como secundarias.
- Registra auditoría IMAGE_ADDED con el admin autenticado.
```

---

## 12. Subir imagen real a Cloudinary

### Request

```http
POST /api/admin/products/{id}/images/upload
Content-Type: multipart/form-data
```

Ejemplo:

```http
POST /api/admin/products/2/images/upload
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

### Respuesta esperada para secundaria

```json
{
  "id": 10,
  "url": "https://res.cloudinary.com/<cloud_name>/image/upload/...",
  "orden": 2,
  "principal": false,
  "altText": "Vista secundaria del producto"
}
```

### Respuesta esperada para principal

```json
{
  "id": 11,
  "url": "https://res.cloudinary.com/<cloud_name>/image/upload/...",
  "orden": 0,
  "principal": true,
  "altText": "Imagen principal del producto"
}
```

Efectos esperados:

```text
- Sube el archivo real a Cloudinary.
- Guarda public_id y secure_url en imagen_producto.
- Si principal=true, reordena imágenes para que la principal quede en orden=0.
- Si principal=false, asigna orden secundario.
- Registra auditoría IMAGE_ADDED con el admin autenticado.
```

Validaciones esperadas:

```text
- Archivo obligatorio.
- Tamaño máximo: según spring.servlet.multipart.max-file-size.
- Tipos permitidos: image/jpeg, image/png, image/webp.
- Imagen secundaria no puede tener orden 0.
- No se permite orden duplicado para el mismo producto.
```

---

## 13. Marcar imagen como principal

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
  "url": "https://res.cloudinary.com/...",
  "orden": 0,
  "principal": true,
  "altText": "Labial negro mate"
}
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
- Si tiene public_id de Cloudinary, elimina el asset real de Cloudinary.
- Si era la principal y quedan imágenes, promueve/reordena otra imagen.
- Registra auditoría IMAGE_DELETED con el admin autenticado.
```

---

# Endpoints admin de usuarios

Todos requieren:

```http
Authorization: Bearer <token>
```

Actualmente todos los usuarios creados desde API se crean con rol:

```text
ADMIN
```

El rol está modelado como enum:

```java
public enum AdminRole {
    ADMIN
}
```

---

## 15. Listar usuarios admin

### Request

```http
GET /api/admin/users
```

### Body

No requiere body.

### Respuesta esperada

```json
[
  {
    "id": 1,
    "email": "admin@gabriela.com",
    "nombre": "Gabriela",
    "rol": "ADMIN",
    "activo": true,
    "fechaCreacion": "2026-06-04T00:00:00Z",
    "fechaUltimaActualizacion": "2026-06-04T00:00:00Z"
  }
]
```

---

## 16. Crear usuario admin

### Request

```http
POST /api/admin/users
Content-Type: application/json
```

### Body

```json
{
  "email": "empleado@gabriela.com",
  "nombre": "Empleado Tienda",
  "password": "Empleado123"
}
```

### Respuesta esperada

```json
{
  "id": 3,
  "email": "empleado@gabriela.com",
  "nombre": "Empleado Tienda",
  "rol": "ADMIN",
  "activo": true,
  "fechaCreacion": "2026-06-04T00:00:00Z",
  "fechaUltimaActualizacion": "2026-06-04T00:00:00Z"
}
```

Efectos esperados:

```text
- Crea un nuevo usuario admin.
- Normaliza email a minúsculas.
- Guarda pass_hash con BCrypt.
- No devuelve pass_hash en la respuesta.
- El nuevo usuario puede iniciar sesión con POST /api/auth/login.
```

---

## 17. Desactivar usuario admin

### Request

```http
PATCH /api/admin/users/{id}/deactivate
```

Ejemplo:

```http
PATCH /api/admin/users/3/deactivate
```

### Body

No requiere body.

### Respuesta esperada

```json
{
  "id": 3,
  "email": "empleado@gabriela.com",
  "nombre": "Empleado Tienda",
  "rol": "ADMIN",
  "activo": false,
  "fechaCreacion": "2026-06-04T00:00:00Z",
  "fechaUltimaActualizacion": "2026-06-04T01:00:00Z"
}
```

Efectos esperados:

```text
- usuario_admin.activo pasa a false.
- El usuario desactivado no debe poder hacer login.
```

---

## 18. Reactivar usuario admin

### Request

```http
PATCH /api/admin/users/{id}/activate
```

Ejemplo:

```http
PATCH /api/admin/users/3/activate
```

### Body

No requiere body.

### Respuesta esperada

```json
{
  "id": 3,
  "email": "empleado@gabriela.com",
  "nombre": "Empleado Tienda",
  "rol": "ADMIN",
  "activo": true,
  "fechaCreacion": "2026-06-04T00:00:00Z",
  "fechaUltimaActualizacion": "2026-06-04T01:05:00Z"
}
```

Efectos esperados:

```text
- usuario_admin.activo pasa a true.
- El usuario vuelve a poder iniciar sesión.
```

---

# Endpoints admin de categorías

Pendiente de implementación.

Objetivo funcional:

```text
Permitir que el panel admin pueda crear, editar, listar y eliminar categorías sin usar SQL.
```

Endpoints previstos:

```http
GET    /api/admin/categories
POST   /api/admin/categories
PUT    /api/admin/categories/{id}
DELETE /api/admin/categories/{id}
```

Criterios esperados:

```text
- Requiere Bearer Token.
- El nombre de categoría es obligatorio.
- El slug se genera automáticamente desde el nombre.
- No se permiten nombres duplicados.
- Eliminar una categoría no debe eliminar productos.
- Si producto_categoria tiene ON DELETE CASCADE, al borrar categoría se eliminan solo sus relaciones.
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

## 3. Insertar categorías de prueba

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

Verificar:

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
La imagen principal debería tener orden = 0.
```

---

## 7. Verificar imagen principal de un producto

```sql
SELECT
    p.id_producto,
    p.nombre_producto,
    i.id_imagen,
    i.url,
    i.orden,
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
Esa imagen debería tener orden = 0.
```

---

## 8. Verificar productos desactivados

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

## 9. Verificar usuarios admin

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
Debe listar los usuarios admin creados por SQL o por POST /api/admin/users.
```

Verificar que la contraseña no está en texto plano:

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
pass_hash debe iniciar por $2a$, $2b$ o $2y$.
No debe contener la contraseña real.
```

---

## 10. Verificar auditoría

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

Prueba fuerte:

```text
1. Login con admin@gabriela.com.
2. Ejecutar una acción admin.
3. Verificar auditoría.
4. Login con admin2@gabriela.com.
5. Ejecutar otra acción admin.
6. Verificar que la auditoría cambia de email según el token usado.
```

---

# Errores esperados

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

## Email duplicado en usuario admin

```json
{
  "timestamp": "2026-05-13T...",
  "status": 400,
  "error": "Bad Request",
  "message": "Ya existe un usuario admin con ese email.",
  "path": "/api/admin/users"
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
- No devolver pass_hash en respuestas HTTP.
```

---

# Pendientes inmediatos

```text
[ ] Gestión admin de categorías:
    - GET /api/admin/categories
    - POST /api/admin/categories
    - PUT /api/admin/categories/{id}
    - DELETE /api/admin/categories/{id}

[ ] CORS para frontend
[ ] Tests automatizados
[ ] Preparación de deploy
```
