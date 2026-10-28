import { useEffect, useState } from 'react';
import {
  getBooks, getCart, addToCart, updateQuantity, removeFromCart, checkout, getOrderHistory, login, register,
} from './api';
import { saveSession, getUser, clearSession } from './session';
import Header from './components/Header';
import BookList from './components/BookList';
import Cart from './components/Cart';
import Checkout from './components/Checkout';
import Login from './components/Login';
import OrderHistory from './components/OrderHistory';

const EMPTY_CART = { items: [], total: 0 };

export default function App() {
  const [books, setBooks] = useState([]);
  const [cart, setCart] = useState(EMPTY_CART);
  const [user, setUser] = useState(getUser());
  const [theme, setTheme] = useState(() => localStorage.getItem('bookstore_theme') || 'light');
  const [view, setView] = useState('shop'); // 'shop' | 'login' | 'cart' | 'checkout' | 'done'
  const [order, setOrder] = useState(null);
  const [orderHistory, setOrderHistory] = useState(null);
  const [orderHistoryLoading, setOrderHistoryLoading] = useState(false);
  const [pendingBook, setPendingBook] = useState(null); // book the user tried to add before logging in
  const [error, setError] = useState('');

  const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('bookstore_theme', theme);
  }, [theme]);

  // Load books once; load the cart if we already have a saved login.
  useEffect(() => {
    getBooks().then(setBooks).catch((e) => setError(e.message));
    if (user) getCart().then(setCart).catch(handleError);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function go(nextView) {
    setError('');
    setView(nextView);
  }

  function logout() {
    clearSession();
    setUser(null);
    setCart(EMPTY_CART);
    setOrderHistory(null);
  }

  function handleError(e) {
    if (e.status === 401) {
      // token expired (1 hour) or backend restarted -> log in again
      logout();
      setView('login');
      setError('Your session expired. Please log in again.');
    } else {
      setError(e.message);
    }
  }

  // Runs an API action and shows any error in one place.
  async function run(action) {
    setError('');
    try {
      await action();
    } catch (e) {
      handleError(e);
    }
  }

  async function finishLogin(auth) {
    saveSession(auth);
    setUser({ email: auth.email, fullName: auth.fullName });
    let loaded = await getCart();
    if (pendingBook) {
      loaded = await addToCart(pendingBook.id, 1);
      setPendingBook(null);
    }
    setCart(loaded);
    setView('shop');
  }

  const handleLogin = (email, password) => run(async () => finishLogin(await login(email, password)));
  const handleRegister = (fullName, email, password) =>
    run(async () => finishLogin(await register(fullName, email, password)));

  function handleAdd(book) {
    if (!user) {
      setPendingBook(book);
      go('login');
      return;
    }
    run(async () => setCart(await addToCart(book.id, 1)));
  }

  function handleOpenCart() {
    if (!user) {
      setPendingBook(null);
      go('login');
      return;
    }
    go('cart');
  }

  const handleChangeQuantity = (bookId, quantity) =>
    run(async () => setCart(await updateQuantity(bookId, quantity)));

  const handleRemove = (bookId) => run(async () => setCart(await removeFromCart(bookId)));

  const handlePlaceOrder = () =>
    run(async () => {
      setOrder(await checkout());
      setCart(EMPTY_CART);
      setView('done');
    });

  async function loadOrderHistory(page = 0) {
    setOrderHistoryLoading(true);
    try {
      setOrderHistory(await getOrderHistory(page));
    } finally {
      setOrderHistoryLoading(false);
    }
  }

  function handleOpenOrderHistory() {
    if (!user) {
      go('login');
      return;
    }
    go('orders');
    run(() => loadOrderHistory());
  }

  function renderPage() {
    if (view === 'login') {
      return (
        <Login
          notice={pendingBook ? 'Please log in to add books to your cart.' : ''}
          onLogin={handleLogin}
          onRegister={handleRegister}
        />
      );
    }
    if (view === 'done') {
      return (
        <div>
          <h1>Order confirmed</h1>
          <p>Thank you! Your order number is {order.orderId}.</p>
          <button className="cta" onClick={() => go('shop')}>Continue shopping</button>
        </div>
      );
    }
    if (view === 'checkout') {
      return (
        <div>
          <h1>Checkout</h1>
          <Checkout cart={cart} onPlaceOrder={handlePlaceOrder} onBack={() => go('cart')} />
        </div>
      );
    }
    if (view === 'cart') {
      return (
        <div>
          <h1>Your cart</h1>
          <Cart
            cart={cart}
            onChangeQuantity={handleChangeQuantity}
            onRemove={handleRemove}
            onCheckout={() => go('checkout')}
          />
          <p><button className="secondary" onClick={() => go('shop')}>Continue shopping</button></p>
        </div>
      );
    }
    if (view === 'orders') {
      return (
        <div>
          <h1>Order history</h1>
          <OrderHistory
            history={orderHistory}
            loading={orderHistoryLoading}
            onPageChange={(page) => run(() => loadOrderHistory(page))}
          />
          <p><button className="secondary" onClick={() => go('shop')}>Continue shopping</button></p>
        </div>
      );
    }
    return (
      <div>
        <h1>Books</h1>
        <BookList books={books} onAdd={handleAdd} />
      </div>
    );
  }

  return (
    <>
      <Header
        count={itemCount}
        user={user}
        onHome={() => go('shop')}
        onCart={handleOpenCart}
        onOrders={handleOpenOrderHistory}
        theme={theme}
        onToggleTheme={() => setTheme((current) => (current === 'light' ? 'dark' : 'light'))}
        onLogin={() => { setPendingBook(null); go('login'); }}
        onLogout={() => { logout(); go('shop'); }}
      />
      <main>
        {error && <p role="alert">{error}</p>}
        {renderPage()}
      </main>
    </>
  );
}
