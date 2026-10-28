// Keeps the JWT and basic user info in the browser so a page refresh does not log you out.
const TOKEN_KEY = 'bookstore_token';
const USER_KEY = 'bookstore_user';

export function saveSession({ token, email, fullName }) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify({ email, fullName }));
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getUser() {
  if (!getToken()) return null;
  try {
    return JSON.parse(localStorage.getItem(USER_KEY));
  } catch {
    return null;
  }
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}
