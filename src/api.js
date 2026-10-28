import { getToken } from './session';

const BASE_URL = '/api'; // Vite proxies this to http://localhost:8080

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

// Backend error body: { status, error, message, details: { field: "message" } }
function errorMessage(body, status) {
  if (status === 401) return 'Please log in again';
  if (body && body.details && Object.keys(body.details).length > 0) {
    return Object.values(body.details).join(', ');
  }
  return (body && body.message) || `Request failed (${status})`;
}

async function request(path, options = {}) {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;

  let response;
  try {
    response = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  } catch {
    throw new ApiError('Cannot reach the server. Is the backend running?', 0);
  }

  if (response.status === 204) return null;
  const body = await response.json().catch(() => null);
  if (!response.ok) throw new ApiError(errorMessage(body, response.status), response.status);
  return body;
}

// ---- auth ----
export const register = (fullName, email, password) =>
  request('/auth/register', { method: 'POST', body: JSON.stringify({ fullName, email, password }) });

export const login = (email, password) =>
  request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });

// ---- books (public). The backend returns a Page: { content: [...], totalPages, ... } ----
export async function getBooks() {
  const page = await request('/books?page=0&size=100&sort=title,asc');
  return page.content;
}

// ---- cart (needs login). Every call returns the updated cart: { items: [...], total } ----
export const getCart = () => request('/cart');

export const addToCart = (bookId, quantity = 1) =>
  request('/cart/items', { method: 'POST', body: JSON.stringify({ bookId, quantity }) });

export const updateQuantity = (bookId, quantity) =>
  request(`/cart/items/${bookId}?quantity=${quantity}`, { method: 'PUT' });

export async function removeFromCart(bookId) {
  await request(`/cart/items/${bookId}`, { method: 'DELETE' }); // 204, no body
  return getCart();
}

// ---- checkout: creates the order from the server-side cart. Returns { orderId, total, items, ... } ----
export const checkout = () => request('/orders/checkout', { method: 'POST' });

// ---- payments: starts or retrieves the demo payment for an existing order ----
export const initiatePayment = (orderId, method) =>
  request(`/payments/orders/${orderId}`, {
    method: 'POST',
    body: JSON.stringify({ method }),
  });

export const getPaymentStatus = (orderId) => request(`/payments/orders/${orderId}`);

// ---- order history: returns a paginated Page<OrderResponse>, newest first ----
export const getOrderHistory = (page = 0, size = 20) =>
  request(`/orders?page=${page}&size=${size}`);
