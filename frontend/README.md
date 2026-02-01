# Frontend – SPA React + Vite (Wompi Sandbox)

SPA en React + Vite con Redux Toolkit que permite comprar un producto, introduciendo datos de tarjeta/cliente/delivery, mostrando un resumen del pago y consultando el backend que integra con Wompi Sandbox.

## Tecnologías

- React 19 + TypeScript.
- Vite 7.
- Redux Toolkit + React Redux.
- Axios para llamadas HTTP al backend.
- Jest + Testing Library para tests.

## Arquitectura del frontend

- **Páginas**
  - `src/pages/ProductPage.tsx`: pantalla principal de la app.
    - Muestra el producto (nombre, descripción, precio, stock).
    - Permite abrir un modal con formulario de pago y datos de cliente/delivery.
    - Muestra un resumen con desglose (`amount`, `baseFee`, `deliveryFee`, `total`).
    - Llama al backend para crear la transacción y muestra el resultado (`APPROVED`, `PENDING`, `DECLINED`, `ERROR`).

- **Estado global (Redux Toolkit)**
  - `src/store/product/product.slice.ts`:
    - Estado del producto (`id`, `name`, `description`, `price`, `stockAvailable`, `loading`, `error`).
    - `fetchProductById`: thunk que llama a `/api/products/:id`.
  - `src/store/transaction/transaction.slice.ts`:
    - Estado de la transacción (`status`, `transactionId`, montos, datos de tarjeta, cliente y delivery, `loading`, `error`).
    - `setDraftData`: guarda un borrador de los datos de pago en Redux y en `localStorage`.
    - `clearTransaction`: limpia el estado de transacción.
    - `hydrate` / `hydrateFromStorage`: reconstruyen el estado desde `localStorage`.
    - `createTransaction`: thunk que llama a `/api/transactions` del backend.
  - `src/store/index.ts`:
    - Configura el store de Redux y los hooks `useAppSelector` / `useAppDispatch`.

- **Componentes y utilidades**
  - `src/components/cardValidation.ts`:
    - Detección de marca de tarjeta.
    - Validación de fecha de expiración.
    - Algoritmo de Luhn.

## Requisitos

- Node.js >= 20.
- npm.

## Ejecución en desarrollo

1. Asegúrate de que el backend NestJS se esté ejecutando en `http://localhost:3001`.
   - La forma más sencilla es usar `docker compose up -d` en la raíz o seguir las instrucciones del backend.

2. Instalar dependencias y arrancar Vite:

   ```bash
   cd frontend
   npm install
   npm run dev
   ```

Por defecto la app se sirve en `http://localhost:5173`.

El servidor de desarrollo está configurado para hacer proxy de `/api` al backend, por lo que las llamadas a `/api/products/:id` y `/api/transactions` se redirigen a `http://localhost:3001`.

## Build y preview

Para generar el build de producción:

```bash
cd frontend
npm run build
```

Para previsualizar el build con Vite:

```bash
npm run preview
```

(El backend debe estar corriendo para que las llamadas a `/api` funcionen.)

## Tests y cobertura

### Ejecutar tests

```bash
cd frontend
npm test -- --runInBand
```

### Ejecutar tests con cobertura

```bash
npm test -- --runInBand --coverage
```

Cobertura actual aproximada:

- ~83% *statements*.
- ~85% líneas.

Se incluyen tests para:

- `src/components/cardValidation.ts` – detección de marca, expiración y Luhn.
- `src/pages/ProductPage.tsx` – validación del formulario, manejo de errores por campo y navegación hasta la vista de resumen.
- `src/store/product/product.slice.ts` – estado inicial y ramas `pending/fulfilled/rejected` de `fetchProductById`.
- `src/store/transaction/transaction.slice.ts` – reducers (`setDraftData`, `clearTransaction`, `hydrate`) y ramas `pending/fulfilled/rejected` de `createTransaction`.

## Flujo de usuario

1. El usuario ve un único producto con su precio y stock.
2. Pulsa "Pay with credit card" y se abre un modal con:
   - Datos de tarjeta.
   - Datos del cliente (nombre, email).
   - Dirección de entrega.
3. El formulario valida:
   - Nombre y email del cliente.
   - Dirección de entrega.
   - Número de tarjeta (Luhn, longitud, marca).
   - Fecha de expiración y CVC.
4. Si todo es válido, se muestra un resumen del pago con el desglose de montos.
5. Al confirmar, se llama a `/api/transactions`:
   - El backend integra con Wompi Sandbox.
   - Se muestra el resultado (`APPROVED`, `PENDING`, `DECLINED`, `ERROR`) con un pill de estado y mensajes descriptivos.

## Persistencia de estado

El slice de `transaction` persiste en `localStorage`:

- Permite recuperar un borrador de los datos de pago si el usuario recarga la página.
- Se sincroniza con Redux mediante `hydrateFromStorage` al iniciar la app.

## Integración con el backend

Todas las llamadas de red se hacen contra el backend, nunca directamente a Wompi:

- `GET /api/products/:id` → carga de producto inicial.
- `POST /api/transactions` → creación de transacción y orquestación del flujo con Wompi.

Esto garantiza que las claves de Wompi sólo vivan en el backend, tal como pide la prueba.
