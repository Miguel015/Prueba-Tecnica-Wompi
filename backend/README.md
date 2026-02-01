# Backend – API NestJS (Wompi Sandbox)

API REST construida con NestJS 11, Prisma 7 y PostgreSQL, siguiendo arquitectura hexagonal y Railway Oriented Programming (ROP) para procesar pagos con Wompi Sandbox.

## Tecnologías

- NestJS 11 (TypeScript).
- Prisma 7 + `@prisma/adapter-pg` + `pg`.
- PostgreSQL.
- Axios (integración HTTP con Wompi).
- Jest + ts-jest para tests unitarios.

## Arquitectura

El backend está organizado en módulos de dominio bajo `src/modules`:

- `products` – productos y stock.
- `transactions` – transacciones internas y estados.
- `customers` – clientes.
- `delivery` – entregas asociadas a transacciones.
- `wompi` – integración con la API de Wompi sandbox.

Estructura de capas (hexagonal):

- **Domain (`modules/*/domain`):**
  - Puertos de repositorios (`ProductRepository`, `CustomerRepository`, `TransactionRepository`, `DeliveryRepository`).
  - Puerto del gateway de pagos (`PaymentGatewayPort`).
  - Enums y tipos de estado (`TransactionStatus`, etc.).

- **Application (`modules/*/application`):**
  - Casos de uso como `CreatePaymentTransactionUseCase` y `GetProductByIdUseCase`.
  - Uso de `Result<T, E>` (Railway Oriented Programming) para encadenar pasos (validación → repositorio → Wompi → actualización) y manejar éxito/error de forma explícita.

- **Infrastructure (`modules/*/infrastructure`):**
  - Controladores HTTP (`ProductsController`, `TransactionsController`).
  - Adaptadores de persistencia (repositorios Prisma) para cada agregado.
  - Adaptador HTTP a Wompi: `WompiHttpAdapter`.

- **Shared (`src/shared`):**
  - `Result<T, E>`: tipo monádico con `ok/err`, `isOk/isErr`, mensajes y valores.
  - `PrismaService`: extensión de `PrismaClient` inicializada con `@prisma/adapter-pg` y `pg.Pool`, leyendo `process.env.DATABASE_URL`.

## Modelos de datos (Prisma)

Definidos en `prisma/schema.prisma`:

- `Product`: producto vendible (nombre, descripción, precio).
- `Stock`: cantidades disponibles y reservadas por producto.
- `Customer`: cliente (nombre, email único, documento opcional).
- `Transaction`: transacción interna con estado (`PENDING`, `APPROVED`, `DECLINED`, `ERROR`), montos y referencia de Wompi.
- `Delivery`: entrega asociada a una transacción (dirección y estado de entrega).

## Variables de entorno

Fichero `backend/.env` (ya incluido) con:

```dotenv
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/wompi?schema=public"
PORT=3001

WOMPI_BASE_URL="https://api-sandbox.co.uat.wompi.dev/v1"
WOMPI_PUBLIC_KEY="pub_stagtest_g2u0HQd3ZMh05hsSgTS2lUV8t3s4mOt7"
WOMPI_PRIVATE_KEY="prv_stagtest_5i0ZGIGiFcDQifYsXxvsny7Y37tKqFWg"
WOMPI_INTEGRITY_KEY="stagtest_integrity_nAIBuqayW70XpUqJS4qf4STYiISd89Fp"
```

Puedes cambiar `DATABASE_URL` si usas otra base de datos.

## Configuración de base de datos

1. **Con Docker (recomendado)**

   Desde la raíz del repo:

   ```bash
   docker compose up -d db
   ```

   Esto levanta un PostgreSQL escuchando en `localhost:5433` con:
   - Usuario: `postgres`
   - Password: `postgres`
   - BD: `wompi`

2. **Migraciones y datos de prueba**

   ```bash
   cd backend
   npm install
   npm run prisma:migrate
   npm run prisma:seed
   ```

   El seed crea al menos un producto con stock inicial (precio fijo) para poder probar el flujo de compra.

## Ejecutar el backend

### Desarrollo (sin Docker para el backend)

```bash
cd backend
npm install
npm run start:dev
```

La API quedará en `http://localhost:3001` con prefijo `/api`.

### Backend en contenedor Docker

Usando el `Dockerfile` del backend a través de `docker-compose.yml` (en la raíz):

```bash
cd .. # raíz del repo si no estás
docker compose up -d --build
```

Esto ejecuta el backend dentro de un contenedor que ya se conecta al servicio `db` interno usando una `DATABASE_URL` propia.

## Endpoints principales

La app expone dos endpoints REST principales (bajo el prefijo `/api`):

### GET /api/products/:id

Obtiene un producto por ID, incluyendo su stock disponible.

**Respuesta 200 (ejemplo):**

```json
{
  "id": "00000000-0000-0000-0000-000000000001",
  "name": "Producto demo",
  "description": "Producto de prueba",
  "price": 2000,
  "stockAvailable": 10
}
```

Si el producto no existe, devuelve `404 Not Found`.

### POST /api/transactions

Crea una transacción de pago orquestando:
- Validación de datos (cliente, tarjeta, dirección).
- Verificación de stock del producto.
- Creación de transacción interna en estado `PENDING`.
- Integración con Wompi (tokenización de tarjeta + creación de transacción).
- Actualización de estado interno según Wompi (`APPROVED`, `PENDING`, `ERROR`).
- Creación de un registro de `Delivery` cuando está `APPROVED`.

**Body esperado:**

```json
{
  "productId": "00000000-0000-0000-0000-000000000001",
  "customer": {
    "name": "Miguel Suarez",
    "email": "miguel@example.com",
    "documentNumber": "123456789"
  },
  "delivery": {
    "address": "Street 123"
  },
  "card": {
    "number": "4111111111111111",
    "expMonth": "12",
    "expYear": "40",
    "cvc": "123",
    "cardHolderName": "Miguel Suarez"
  }
}
```

**Ejemplos de respuesta:**

- Éxito / `APPROVED` o `PENDING`:

  ```json
  {
    "transactionId": "tx-uuid",
    "status": "PENDING",
    "productId": "00000000-0000-0000-0000-000000000001",
    "amount": 2000,
    "baseFee": 5,
    "deliveryFee": 10,
    "total": 2015
  }
  ```

- Error de validación u otros (se devuelve `status: "ERROR"` en el JSON):

  ```json
  {
    "status": "ERROR",
    "message": "Customer name must be at least 3 characters"
  }
  ```

## Railway Oriented Programming (ROP)

Los casos de uso utilizan un tipo `Result<T, E>` con las formas `Result.ok(value)` y `Result.err(error)`. Cada paso del caso de uso (`validar → cargar producto → verificar stock → crear transacción → llamar a Wompi → actualizar`) devuelve un `Result`, de modo que los errores se propagan sin lanzar excepciones salvo cuando es necesario.

Los controladores decodifican el `Result`:
- Cuando `isOk`, devuelven el valor como respuesta HTTP 200.
- Cuando `isErr`, mapean el error:
  - En productos: `NotFoundException` (404).
  - En transacciones: payload `{ status: 'ERROR', message: error.message }`.

## Tests y cobertura

### Ejecutar tests

```bash
cd backend
npm test -- --runInBand
```

### Ejecutar tests con cobertura

```bash
npm test -- --runInBand --coverage
```

La configuración de Jest (`package.json`) está ajustada para:
- Medir cobertura sobre `modules/**` y `shared/**`.
- Ignorar wiring de módulos Nest (`*.module.ts`) y `PrismaService`.

Cobertura actual aproximada:

- ~91% *statements*.
- ~90% líneas.

Se testean, entre otros:
- `CreatePaymentTransactionUseCase` (validaciones, integración con Wompi, actualización de estado y stock).
- `GetProductByIdUseCase`.
- Repositorios Prisma (`Product`, `Customer`, `Transaction`, `Delivery`).
- Adaptador Wompi (`WompiHttpAdapter`) con mocks de Axios.
- Controladores `ProductsController` y `TransactionsController`.

## Prisma Studio (opcional)

Para inspeccionar la base de datos con Prisma Studio:

```bash
cd backend
npx prisma studio
```

Asegúrate de tener la base de datos corriendo y `DATABASE_URL` configurado.
