import { useEffect, useState } from 'react';
import {
  getBooks, getCart, addToCart, updateQuantity, removeFromCart, checkout, initiatePayment, getPaymentStatus,
  getOrderHistory, login, register,
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
  const [payment, setPayment] = useState(null);
  const [paymentIssue, setPaymentIssue] = useState('');
  const [placingOrder, setPlacingOrder] = useState(false);
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

  async function handlePlaceOrder(method) {
    setError('');
    setPaymentIssue('');
    setPayment(null);
    setPlacingOrder(true);
    try {
      const placedOrder = await checkout();
      setOrder(placedOrder);
      setCart(EMPTY_CART);

      try {
        const paymentResult = await initiatePayment(placedOrder.orderId, method);
        setPayment(paymentResult);
      } catch (paymentError) {
        try {
          // A request can time out after the server persisted the payment. Check before reporting it missing.
          setPayment(await getPaymentStatus(placedOrder.orderId));
        } catch {
          setPaymentIssue(
            `Your order was created, but its payment status could not be confirmed. ${paymentError.message} Check the status before taking further action.`,
          );
        }
      }
      setView('done');
    } catch (e) {
      handleError(e);
    } finally {
      setPlacingOrder(false);
    }
  }

  async function handleCheckPaymentStatus() {
    if (!order) return;
    setError('');
    setPaymentIssue('');
    try {
      setPayment(await getPaymentStatus(order.orderId));
    } catch (e) {
      setPaymentIssue(e.status === 404
        ? 'No payment record was found. Your order is still placed; please contact support before trying another payment.'
        : e.message);
    }
  }

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
        <section className="confirmation-card" aria-labelledby="confirmation-heading">
          <div className="confirmation-mark" aria-hidden="true">✓</div>
          <span className="eyebrow">THANK YOU FOR YOUR ORDER</span>
          <h1 id="confirmation-heading">Order confirmed</h1>
          <p className="confirmation-copy">Your order <strong>#{order.orderId}</strong> is placed. We’re getting your books ready.</p>
          {payment && (
            <div className="payment-result" role="status">
              <div>
                <span className="note">Payment · {payment.method.replaceAll('_', ' ')}</span>
                <strong className={`payment-status payment-status-${payment.status.toLowerCase()}`}>
                  {payment.status === 'PENDING' ? 'Due on delivery' : 'Demo payment successful'}
                </strong>
              </div>
              <span className="note">{payment.status === 'SUCCEEDED' ? 'No real charge was made' : 'Pay when your order arrives'}</span>
            </div>
          )}
          {paymentIssue && (
            <div className="payment-recovery" role="alert">
              <p>{paymentIssue}</p>
              <button className="secondary" onClick={handleCheckPaymentStatus}>Check payment status</button>
            </div>
          )}
          <button className="cta confirmation-action" onClick={() => go('shop')}>Continue shopping</button>
        </section>
      );
    }
    if (view === 'checkout') {
      return (
        <section className="page-section" aria-busy={placingOrder}>
          <div className="page-heading">
            <span className="eyebrow">ALMOST YOURS</span>
            <h1>Checkout</h1>
            <p className="note">Review your books and select a payment method.</p>
          </div>
          <Checkout
            cart={cart}
            onPlaceOrder={handlePlaceOrder}
            onBack={() => go('cart')}
            submitting={placingOrder}
          />
        </section>
      );
    }
    if (view === 'cart') {
      return (
        <section className="page-section">
          <div className="page-heading">
            <span className="eyebrow">A GOOD READ IS CLOSE</span>
            <h1>Your cart</h1>
            <p className="note">A little stack of something wonderful.</p>
          </div>
          <Cart
            cart={cart}
            onChangeQuantity={handleChangeQuantity}
            onRemove={handleRemove}
            onCheckout={() => go('checkout')}
          />
          <p><button className="secondary" onClick={() => go('shop')}>Continue shopping</button></p>
        </section>
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
      <section className="page-section shop-section">
        <div className="shop-hero">
          <div className="shop-hero-copy">
            <span className="eyebrow">THE ONLINE BOOKSTORE</span>
            <h1>Find your next<br /><span>favorite story.</span></h1>
            <p>Thoughtful reads, timeless ideas, and new worlds—picked for your next quiet moment.</p>
            <button className="hero-link" onClick={() => document.getElementById('book-shelf')?.scrollIntoView({ behavior: 'smooth' })}>
              Browse the collection <span aria-hidden="true">↓</span>
            </button>
          </div>
          <div className="hero-art" aria-hidden="true">
            <div className="hero-sun" />
            <div className="hero-book hero-book-back" />
            <div className="hero-book hero-book-front"><span>STORIES<br />THAT STAY</span></div>
            <span className="hero-spark hero-spark-one">✦</span>
            <span className="hero-spark hero-spark-two">✦</span>
          </div>
        </div>
        <div className="collection-heading" id="book-shelf">
          <div>
            <span className="eyebrow">THE SHELF</span>
            <h2>Books worth getting lost in</h2>
          </div>
          <span className="collection-count">{books.length} {books.length === 1 ? 'book' : 'books'}</span>
        </div>
        <BookList books={books} onAdd={handleAdd} />
      </section>
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
        {error && <p className="app-alert" role="alert">{error}</p>}
        {renderPage()}
      </main>
    </>
  );
}
