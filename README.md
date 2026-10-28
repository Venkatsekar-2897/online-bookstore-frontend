# Bookstore Frontend (React + JavaScript)

## Run
1. Start the Spring Boot backend (`mvn spring-boot:run` in `bookstore-backend`) - it listens on http://localhost:8080.
2. Then:
```bash
npm install
npm run dev      # http://localhost:5173
```
Vite proxies `/api/*` to the backend (see `vite.config.js`), so no extra CORS setup is needed.

## Test
```bash
npm test
```
Tests mock `src/api.js`, so they run without the backend.

## How it works with the backend
- To make the UI functional the backend should be started in localhost:8080
- Browsing books is public (`GET /api/books`, paginated; the UI loads the first 100).
- Add to cart / cart page / checkout need a login. Register or log in, and the JWT is kept in `localStorage`; every API call sends `Authorization: Bearer <token>`.
- The cart lives on the server (`/api/cart/...`); each call returns the updated cart, which the UI displays.
- Checkout is `POST /api/orders/checkout` (no body) and returns the order.
- Order history is available to signed-in users from the header; it uses paginated `GET /api/orders?page=0&size=20` results.
- Use the header theme button to switch between light and dark appearance; the selection is saved in browser storage.
- A `401` (token expires after 1 hour, or the backend was restarted - keys are regenerated) logs the user out and opens the login page.

## Structure
- `src/api.js`         all REST calls + error handling
- `src/session.js`     token/user stored in the browser
- `src/format.js`      price formatting
- `src/components/`    Header (cart icon, order history, sign in/out), BookList (tiles), Cart, Checkout, OrderHistory, Login, Cover
- `src/App.jsx`        holds state, switches between shop / login / cart / checkout / confirmation / order history
- `src/styles.css`     responsive marketplace styling and light/dark theme tokens
