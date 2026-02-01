# Prueba Técnica Wompi – Fullstack

Monorepo con una API en NestJS y una SPA en React para procesar pagos con Wompi Sandbox, controlando stock, transacciones y deliveries.

- Backend: NestJS 11 + Prisma + PostgreSQL + arquitectura hexagonal + Railway Oriented Programming (ROP).
- Frontend: React + Vite + Redux Toolkit, mobile-first, persistiendo el borrador de la transacción en el navegador.

## Deploy en la nube

- Frontend (SPA): https://prueba-tecnica-wompi.vercel.app/
- Backend (API – Swagger): https://prueba-tecnica-wompi.onrender.com/docs

Documentación de la API y pruebas:

- Base URL de la API: https://prueba-tecnica-wompi.onrender.com (todas las rutas reales están bajo `/api`).
- Swagger UI: https://prueba-tecnica-wompi.onrender.com/docs
- Colección de Postman: `postman/wompi-payment.postman_collection.json` (usar la variable `baseUrl` para apuntar a local o Render).

Producto de prueba semillado en la base de datos:

- ID: `00000000-0000-0000-0000-000000000001`
- Endpoint directo: https://prueba-tecnica-wompi.onrender.com/api/products/00000000-0000-0000-0000-000000000001

## Estructura del proyecto

- `backend/` – API REST en NestJS.
- `frontend/` – SPA en React + Vite.
- `docker-compose.yml` – Levanta PostgreSQL y el backend NestJS en contenedores.

## Requisitos

- Node.js >= 20 (recomendado LTS reciente).
- npm (incluido con Node).
- Docker + Docker Compose (opcional pero recomendado para probar rápido).

---

## Ejecución rápida para el revisor

Esta es la forma más sencilla de probar el flujo completo.

1. **Levantar base de datos y backend con Docker Compose**

   Desde la raíz del repo:

   ```bash
   docker compose up -d --build
   ```

   Esto levanta:
   - PostgreSQL en `localhost:5433` (usuario `postgres` / contraseña `postgres` / BD `wompi`).
   - Backend NestJS en `http://localhost:3001` usando las variables de entorno de Wompi sandbox.

2. **Instalar y arrancar el frontend**

   ```bash
   cd frontend
   npm install
   npm run dev
   ```

   Por defecto Vite arranca en `http://localhost:5173` y está configurado para hacer proxy de `/api` hacia `http://localhost:3001`, así que no hay que tocar nada más.

3. **Probar el flujo**

   - Abrir `http://localhost:5173`.
   - Ver el producto de prueba y su stock.
   - Pagar con tarjeta de prueba (Wompi sandbox, flujo simulado).
   - Ver la transacción creada y el resultado del pago (APPROVED / PENDING / ERROR).

---

## Ejecución detallada sin Docker (opcional)

Si prefieres correr el backend sin contenedor:

1. Asegúrate de tener PostgreSQL corriendo (puede ser en Docker con el mismo `docker compose up -d db`).

2. Variables de entorno del backend

   En `backend/.env` ya viene configurado un `DATABASE_URL` compatible con la BD del `docker-compose.yml`:

   ```dotenv
   DATABASE_URL="postgresql://postgres:postgres@localhost:5433/wompi?schema=public"
   PORT=3001
   # claves de Wompi sandbox ya incluidas
   ```

3. Migraciones y seed

   ```bash
   cd backend
   npm install
   npm run prisma:migrate
   npm run prisma:seed
   ```

4. Arrancar el backend en modo desarrollo

   ```bash
   npm run start:dev
   ```

5. Frontend

   ```bash
   cd ../frontend
   npm install
   npm run dev
   ```

---

## Tests y cobertura

### Backend

Desde `backend/`:

- Ejecutar tests:

  ```bash
  npm test -- --runInBand
  ```

- Ejecutar tests con cobertura:

  ```bash
  npm test -- --runInBand --coverage
  ```

La cobertura se calcula sólo sobre código de negocio y adaptadores (`modules/**` y `shared/**`), ignorando los módulos de wiring (`*.module.ts`) y el `PrismaService`. Los valores actuales son aproximadamente:

- ~91% de *statements*.
- ~90% de líneas.

### Frontend

Desde `frontend/`:

- Ejecutar tests:

  ```bash
  npm test -- --runInBand
  ```

- Ejecutar tests con cobertura:

  ```bash
  npm test -- --runInBand --coverage
  ```

Cobertura aproximada:

- ~83% de *statements*.
- ~85% de líneas.

Se testean:
- Validación de tarjeta (`cardValidation`).
- Flujo de formulario y resumen en `ProductPage`.
- Slices de Redux (`product.slice` y `transaction.slice`).

---

## Arquitectura (visión general)

### Backend (NestJS + Hexagonal + ROP)

- **Domain (puertos):** interfaces de repositorios y del `PaymentGatewayPort` (`modules/*/domain`).
- **Application (casos de uso):** lógica de negocio en `create-payment-transaction.usecase` y `get-product-by-id.usecase`, usando un tipo `Result` (Railway Oriented Programming) para encadenar operaciones y manejar errores.
- **Infrastructure:**
  - Controladores HTTP (`products.controller`, `transactions.controller`).
  - Repositorios Prisma para Product, Customer, Transaction, Delivery.
  - Adaptador HTTP a Wompi sandbox (`WompiHttpAdapter`).
- **Shared:**
  - `Result<T, E>` para ROP.
  - `PrismaService` que encapsula la conexión a PostgreSQL con el adapter oficial de Prisma 7 para `pg`.

### Frontend (React + Redux Toolkit)

- **SPA Vite + React:** una única pantalla principal `ProductPage` con el flujo completo de compra.
- **Estado global:**
  - `product` slice: carga el producto (precio, stock) desde el backend.
  - `transaction` slice: guarda el borrador de la transacción (cliente, delivery, tarjeta), el estado del pago y persiste en `localStorage`.
- **Integración con backend:** llamadas HTTP con Axios a `/api/products/:id` y `/api/transactions`.
- **UI/UX:** diseño mobile-first, modales para formulario, resumen y resultado; validaciones fuertes en el formulario antes de llamar al backend.

---

## Más detalles

- Detalles de la API y modelos de dominio en [backend/README.md](backend/README.md).
- Detalles de la SPA, slices y flujo de UI en [frontend/README.md](frontend/README.md).
