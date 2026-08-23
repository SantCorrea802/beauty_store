# Frontend Hajuvi

Aplicación web de Hajuvi construida con Vite, React, TypeScript y React Router.

Consume la API REST del backend Hajuvi y cubre catálogo público, cuentas de cliente, verificación de email, recuperación de contraseña, favoritos, carrito y pedido por WhatsApp.

## Estado

Implementado:

```text
- Catálogo público.
- Filtro/búsqueda de productos en interfaz.
- Detalle de producto por slug.
- Registro de cliente.
- Verificación de email por token.
- Login de cliente.
- Perfil de cliente protegido.
- Cambio de contraseña.
- Recuperación/reset de contraseña.
- Favoritos.
- Carrito.
- Pedido por WhatsApp.
- Header compartido.
- Logo Hajuvi.
- Rewrite de Vercel para rutas SPA.
```

Pendiente principal:

```text
- Login admin frontend.
- Dashboard admin.
- Gestión admin de productos, imágenes, categorías y usuarios.
- Mejoras de UX, accesibilidad y validación visual.
- Tests frontend.
```

## Stack

```text
Vite
React
TypeScript
React Router DOM
Fetch API
CSS global
```

No se usa todavía:

```text
Redux/Zustand
React Query
Axios
Tailwind
UI library
```

Esto mantiene baja la complejidad mientras el producto sigue en etapa inicial.

## Estructura relevante

```text
frontend/
  public/
    logo-hajuvi.png
  src/
    api/
      authApi.ts
      cartApi.ts
      categoriesApi.ts
      favoritesApi.ts
      http.ts
      productsApi.ts
    auth/
      authStorage.ts
      CustomerProtectedRoute.tsx
    components/
      AppHeader.tsx
      ProductCard.tsx
    pages/
      HomePage.tsx
      ProductDetailPage.tsx
      auth/
      customer/
    types/
    App.tsx
    main.tsx
    index.css
  vercel.json
```

## Ejecución local

```bash
cd frontend
copy .env.example .env
npm install
npm run dev
```

URL local:

```text
http://localhost:5173
```

## Build

```bash
npm run build
```

Preview local del build:

```bash
npm run preview
```

## Variables de entorno

Archivo local:

```text
frontend/.env
```

Ejemplo:

```env
VITE_API_BASE_URL=http://localhost:8080
VITE_WHATSAPP_PUBLIC_URL=https://wa.me/<numero>
VITE_INSTAGRAM_URL=https://www.instagram.com/<usuario>
```

Producción:

```env
VITE_API_BASE_URL=https://api.hajuvi.com
```

Notas:

```text
- Solo usar VITE_ para variables expuestas al navegador.
- No poner secretos en frontend.
- Si se cambia .env, reiniciar npm run dev.
```

## Rutas

```text
/                    Home/catálogo
/products/:slug      Detalle de producto
/register            Registro cliente
/verify-email        Verificación de email por token
/login               Login cliente
/forgot-password     Solicitar recuperación
/reset-password      Resetear contraseña por token
/me                  Perfil cliente protegido
/me/password         Cambio de contraseña
/me/favorites        Favoritos
/me/cart             Carrito
```

## Cliente HTTP

`src/api/http.ts` centraliza:

```text
- Base URL desde VITE_API_BASE_URL.
- Headers Accept/Content-Type.
- Bearer token de cliente cuando authenticated=true.
- Conversión de errores HTTP a ApiError.
```

El token de cliente se guarda en localStorage con key:

```text
hajuvi_customer_access_token
```

Cuando se implemente admin, debe usarse una key separada, por ejemplo:

```text
hajuvi_admin_access_token
```

No mezclar sesión cliente y sesión admin.

## Deploy en Vercel

Configuración esperada:

```text
Root Directory: frontend
Build Command: npm run build
Output Directory: dist
Production Branch: main, cuando main sea la rama estable
```

Variable de producción:

```env
VITE_API_BASE_URL=https://api.hajuvi.com
```

`frontend/vercel.json` debe existir para que React Router funcione al abrir rutas directamente:

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

Sin ese rewrite, rutas como `/verify-email` o `/reset-password` pueden devolver 404 de Vercel al abrirlas directamente.

## Validación mínima

```text
1. npm run build pasa.
2. / carga catálogo.
3. /products/:slug abre detalle.
4. Registro envía correo.
5. /verify-email?token=... verifica cuenta.
6. Login cliente guarda sesión.
7. /me carga perfil.
8. Favoritos funcionan.
9. Carrito funciona.
10. Pedido WhatsApp abre URL válida.
11. /forgot-password y /reset-password funcionan.
```

## Errores comunes

### `VITE_API_BASE_URL` no definida

Crear/actualizar `frontend/.env` y reiniciar Vite.

### `Failed to fetch`

Causas probables:

```text
- Backend caído o dormido.
- VITE_API_BASE_URL incorrecta.
- CORS no permite el origen actual.
```

### 404 en rutas internas en Vercel

Revisar `frontend/vercel.json` y redeploy.

### Login funciona en Postman pero no en navegador

Revisar CORS y que el frontend apunte a `https://api.hajuvi.com`, no a una URL vieja.

## Próxima etapa

Crear frontend admin:

```text
/admin/login
/admin
/admin/products
/admin/products/new
/admin/products/:id/edit
/admin/categories
/admin/users
```

# Frontend - Tienda Gabriela

Frontend web para la tienda Gabriela. Está construido con **Vite + React + TypeScript** y consume el backend REST desplegado en Render.

Este frontend todavía está en fase inicial. Por ahora implementa el catálogo público mínimo:

```text
[OK] Proyecto Vite + React + TypeScript
[OK] React Router configurado
[OK] Variable de entorno VITE_API_BASE_URL
[OK] Cliente HTTP base con fetch
[OK] Manejo básico de errores de API
[OK] Tipos TypeScript para productos, categorías e imágenes
[OK] API de productos públicos
[OK] Página pública de catálogo
[OK] Página pública de detalle de producto por slug
[OK] Estilos globales base en index.css
```

Pendiente:

```text
[ ] Listar categorías en frontend
[ ] Filtrar productos por categoría
[ ] Login admin
[ ] Persistencia de JWT en frontend
[ ] Rutas admin protegidas
[ ] Panel admin de productos
[ ] Panel admin de categorías
[ ] Panel admin de usuarios
[ ] Gestión de imágenes desde panel
[ ] Diseño visual final
[ ] Deploy en Vercel
```

---

## Stack técnico

```text
Vite
React
TypeScript
React Router DOM
Fetch API
CSS global básico
```

No se está usando todavía:

```text
Redux
Zustand
Tailwind
React Query
Axios
UI library
```

Eso es intencional. Para esta etapa inicial, el objetivo es validar conexión real con el backend antes de agregar más dependencias.

---

## Arquitectura actual

Flujo general:

```text
Navegador
  ↓
React Router
  ↓
Página pública
  ↓
API client en src/api
  ↓
Backend Render
  ↓
Supabase PostgreSQL / Cloudinary
```

Estructura relevante:

```text
frontend/
  src/
    api/
      http.ts
      productsApi.ts
    pages/
      public/
        HomePage.tsx
        ProductDetailPage.tsx
    types/
      product.ts
    App.tsx
    main.tsx
    index.css
  .env
  .env.example
  package.json
```

Responsabilidades:

```text
src/api/http.ts
- Define funciones genéricas GET, POST, PUT, PATCH y DELETE.
- Lee VITE_API_BASE_URL.
- Agrega headers comunes.
- Convierte errores HTTP en ApiError.

src/api/productsApi.ts
- Consume endpoints públicos de productos.
- Implementa getProducts() y getProductBySlug().

src/types/product.ts
- Define tipos TypeScript para ProductSummary, ProductDetail, Category y ProductImage.

src/pages/public/HomePage.tsx
- Carga productos activos desde GET /api/products.
- Muestra nombre, marca, precio, imagen principal y link al detalle.

src/pages/public/ProductDetailPage.tsx
- Lee el slug desde la URL.
- Consulta GET /api/products/{slug}.
- Muestra detalle, categorías e imágenes del producto.

src/App.tsx
- Define rutas públicas.

src/main.tsx
- Monta React en el DOM.
- Configura BrowserRouter.

src/index.css
- Define estilos globales mínimos.
```

---

## Variables de entorno

Crear este archivo en la raíz del frontend:

```text
frontend/.env
```

Contenido:

```env
VITE_API_BASE_URL=https://gabriela-store-backend.onrender.com
```

También existe o debe existir:

```text
frontend/.env.example
```

con el mismo nombre de variable, pero sin secretos:

```env
VITE_API_BASE_URL=https://gabriela-store-backend.onrender.com
```

Notas importantes:

```text
- Las variables expuestas al frontend deben empezar por VITE_.
- VITE_API_BASE_URL no es secreta; es la URL pública del backend.
- Nunca poner JWT_SECRET, CLOUDINARY_API_SECRET, DB_PASSWORD ni secretos en el frontend.
- Si cambias .env, reinicia npm run dev.
```

---

## Instalación local

Desde la raíz del repositorio:

```bash
cd frontend
npm install
```

Luego ejecutar:

```bash
npm run dev
```

Vite debería mostrar algo como:

```text
Local: http://localhost:5173/
```

Abrir en el navegador:

```text
http://localhost:5173
```

---

## Requisitos para que se vean datos

El frontend consume el backend desplegado:

```text
https://gabriela-store-backend.onrender.com
```

El backend debe estar funcionando y debe permitir CORS para:

```text
http://localhost:5173
```

En Render, la variable del backend debe incluir:

```env
CORS_ALLOWED_ORIGINS=http://localhost:5173
```

Si el backend está en Render Free, puede dormirse por inactividad. En ese caso, la primera carga puede tardar varios segundos.

---

## Endpoints consumidos actualmente

### Listar productos activos

```http
GET /api/products
```

URL completa usada por el frontend:

```text
https://gabriela-store-backend.onrender.com/api/products
```

Respuesta esperada:

```json
[
  {
    "id": 1,
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

Si no hay productos activos, la respuesta puede ser:

```json
[]
```

En ese caso el frontend muestra:

```text
No hay productos disponibles.
```

---

### Consultar detalle de producto

```http
GET /api/products/{slug}
```

Ejemplo:

```text
https://gabriela-store-backend.onrender.com/api/products/labial-negro-mate
```

Respuesta esperada:

```json
{
  "id": 1,
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

Ruta del frontend:

```text
/products/{slug}
```

Ejemplo:

```text
http://localhost:5173/products/labial-negro-mate
```

---

## Paso a paso para probar lo implementado

### 1. Verificar que el backend responde

En navegador o Postman:

```http
GET https://gabriela-store-backend.onrender.com/api/products
```

Resultado esperado:

```text
200 OK
```

Puede devolver una lista de productos o una lista vacía.

---

### 2. Verificar `.env` del frontend

Archivo:

```text
frontend/.env
```

Debe tener:

```env
VITE_API_BASE_URL=https://gabriela-store-backend.onrender.com
```

Si lo creaste o modificaste, reinicia Vite.

---

### 3. Levantar frontend

Desde terminal:

```bash
cd frontend
npm run dev
```

Abrir:

```text
http://localhost:5173
```

---

### 4. Probar catálogo

En la página principal debe pasar uno de estos casos:

```text
Caso A:
Se muestran productos activos con nombre, precio, marca, imagen principal y link de detalle.

Caso B:
Si no hay productos activos, se muestra: No hay productos disponibles.

Caso C:
Si el backend falla, se muestra un mensaje de error.
```

---

### 5. Probar detalle de producto

Si un producto aparece en el catálogo, hacer clic en:

```text
Ver detalle
```

Debe navegar a:

```text
/products/{slug}
```

Y mostrar:

```text
- Nombre del producto
- Marca, si existe
- Precio
- Descripción, si existe
- Categorías
- Imágenes
```

---

## Errores comunes

### Error: `Failed to resolve import "./index.css"`

Causa:

```text
src/main.tsx importa ./index.css, pero src/index.css no existe.
```

Solución:

```text
Crear frontend/src/index.css
```

---

### Error: `VITE_API_BASE_URL no está definida`

Causa:

```text
No existe frontend/.env o la variable está mal escrita.
```

Solución:

```env
VITE_API_BASE_URL=https://gabriela-store-backend.onrender.com
```

Luego reiniciar:

```bash
npm run dev
```

---

### Error CORS en navegador

Causa posible:

```text
El backend no permite http://localhost:5173 en CORS_ALLOWED_ORIGINS.
```

Solución en Render backend:

```env
CORS_ALLOWED_ORIGINS=http://localhost:5173
```

Si luego el frontend está en Vercel:

```env
CORS_ALLOWED_ORIGINS=http://localhost:5173,https://tu-frontend.vercel.app
```

---

### La primera carga tarda mucho

Causa:

```text
Render Free duerme el servicio después de inactividad.
```

Solución temporal:

```text
Esperar a que despierte.
```

Solución real para producción:

```text
Usar una instancia paga que no duerma.
```

---

## Scripts disponibles

```bash
npm run dev
```

Levanta Vite en desarrollo.

```bash
npm run build
```

Compila el frontend para producción.

```bash
npm run preview
```

Sirve localmente el build generado.

---

## Estado actual

Implementado:

```text
[OK] Catálogo público básico.
[OK] Detalle público de producto.
[OK] Consumo del backend desplegado.
[OK] Tipado inicial de datos.
[OK] Manejo básico de loading/error.
```

Siguiente etapa recomendada:

```text
1. Consumir GET /api/categories.
2. Agregar filtro por categoría en catálogo.
3. Implementar login admin.
4. Guardar JWT.
5. Crear layout admin protegido.
6. Construir panel admin por módulos.
```
