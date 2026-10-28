import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import App from './App';
import { getBooks, getCart, addToCart, removeFromCart, checkout, getOrderHistory, login } from './api';
import { saveSession } from './session';

vi.mock('./api'); // replaces the real fetch calls with mocks

const books = [{ id: 1, title: 'Clean Code', author: 'Robert Martin', price: 30, stock: 10 }];
const EMPTY = { items: [], total: 0 };
const CART_WITH_ONE = {
  items: [{ bookId: 1, title: 'Clean Code', author: 'Robert Martin', unitPrice: 30, quantity: 1, lineTotal: 30 }],
  total: 30,
};

function loginAs() {
  saveSession({ token: 'test-token', email: 'asha@example.com', fullName: 'Asha Kumar' });
}

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
  getBooks.mockResolvedValue(books);
  getCart.mockResolvedValue(EMPTY);
});

const clickAdd = async () =>
  userEvent.click(await screen.findByRole('button', { name: 'Add Clean Code to cart' }));

describe('App (logged out)', () => {
  it('shows books as tiles without calling the cart API', async () => {
    render(<App />);
    expect(await screen.findByText('Clean Code')).toBeInTheDocument();
    expect(getCart).not.toHaveBeenCalled();
  });

  it('shows an error when books cannot be loaded', async () => {
    getBooks.mockRejectedValue(new Error('Cannot reach the server. Is the backend running?'));
    render(<App />);
    expect(await screen.findByRole('alert')).toHaveTextContent('Cannot reach the server');
  });

  it('sends the user to the login page when adding without being logged in', async () => {
    render(<App />);
    await clickAdd();
    expect(screen.getByRole('heading', { name: 'Log in' })).toBeInTheDocument();
    expect(screen.getByText('Please log in to add books to your cart.')).toBeInTheDocument();
    expect(addToCart).not.toHaveBeenCalled();
  });

  it('logs in and then adds the book the user picked', async () => {
    login.mockResolvedValue({ token: 'abc', tokenType: 'Bearer', email: 'asha@example.com', fullName: 'Asha Kumar' });
    addToCart.mockResolvedValue(CART_WITH_ONE);
    render(<App />);
    await clickAdd();

    await userEvent.type(screen.getByLabelText('Email'), 'asha@example.com');
    await userEvent.type(screen.getByLabelText('Password'), 'password123');
    await userEvent.click(screen.getByRole('button', { name: 'Log in' }));

    expect(await screen.findByRole('button', { name: 'Open cart (1)' })).toBeInTheDocument();
    expect(addToCart).toHaveBeenCalledWith(1, 1);
    expect(screen.getByText('Hi, Asha')).toBeInTheDocument();
  });

  it('shows the backend message when login fails', async () => {
    login.mockRejectedValue(new Error('Invalid email or password'));
    render(<App />);
    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }));
    await userEvent.type(screen.getByLabelText('Email'), 'asha@example.com');
    await userEvent.type(screen.getByLabelText('Password'), 'wrongpass1');
    await userEvent.click(screen.getByRole('button', { name: 'Log in' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Invalid email or password');
  });
});

describe('App (logged in)', () => {
  beforeEach(loginAs);

  it('adds a book and updates the cart icon', async () => {
    addToCart.mockResolvedValue(CART_WITH_ONE);
    render(<App />);
    await clickAdd();
    expect(await screen.findByRole('button', { name: 'Open cart (1)' })).toBeInTheDocument();
    expect(addToCart).toHaveBeenCalledWith(1, 1);
  });

  it('shows the backend message when adding fails', async () => {
    addToCart.mockRejectedValue(new Error('Requested quantity exceeds available stock'));
    render(<App />);
    await clickAdd();
    expect(await screen.findByRole('alert')).toHaveTextContent('exceeds available stock');
  });

  it('opens the cart page and removes an item', async () => {
    getCart.mockResolvedValue(CART_WITH_ONE);
    removeFromCart.mockResolvedValue(EMPTY);
    render(<App />);
    await userEvent.click(await screen.findByRole('button', { name: 'Open cart (1)' }));
    expect(screen.getByText('Total: $30.00')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Remove Clean Code' }));
    expect(await screen.findByText('Your cart is empty.')).toBeInTheDocument();
    expect(removeFromCart).toHaveBeenCalledWith(1);
  });

  it('completes checkout', async () => {
    getCart.mockResolvedValue(CART_WITH_ONE);
    checkout.mockResolvedValue({ orderId: 7, status: 'PLACED', total: 30, items: [] });
    render(<App />);
    await userEvent.click(await screen.findByRole('button', { name: 'Open cart (1)' }));
    await userEvent.click(screen.getByRole('button', { name: 'Checkout' }));
    await userEvent.click(screen.getByRole('button', { name: 'Place order' }));

    expect(await screen.findByText('Order confirmed')).toBeInTheDocument();
    expect(screen.getByText(/order number is 7/)).toBeInTheDocument();
  });

  it('loads paginated order history', async () => {
    getOrderHistory.mockResolvedValue({
      content: [{
        orderId: 7,
        status: 'PLACED',
        createdAt: '2026-10-28T10:00:00Z',
        total: 30,
        items: [{ bookId: 1, title: 'Clean Code', quantity: 1, lineTotal: 30 }],
      }],
      number: 0,
      totalPages: 2,
    });
    render(<App />);
    await userEvent.click(screen.getByRole('button', { name: 'Order history' }));

    expect(await screen.findByRole('heading', { name: 'Order history' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Order #7' })).toBeInTheDocument();
    expect(screen.getByText('Clean Code x 1 = $30.00')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Next' }));
    expect(getOrderHistory).toHaveBeenNthCalledWith(2, 1);
  });

  it('toggles and persists the selected theme', async () => {
    render(<App />);
    await userEvent.click(screen.getByRole('button', { name: 'Switch to dark theme' }));
    expect(document.documentElement).toHaveAttribute('data-theme', 'dark');
    expect(localStorage.getItem('bookstore_theme')).toBe('dark');
    expect(screen.getByRole('button', { name: 'Switch to light theme' })).toBeInTheDocument();
  });

  it('logs out and asks to log in again when the token is rejected (401)', async () => {
    getCart.mockRejectedValue(Object.assign(new Error('Please log in again'), { status: 401 }));
    render(<App />);
    expect(await screen.findByText('Your session expired. Please log in again.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign in' })).toBeInTheDocument();
  });
});
