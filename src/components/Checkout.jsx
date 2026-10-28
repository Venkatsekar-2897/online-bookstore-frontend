import { useState } from 'react';
import { formatPrice } from '../format';

const PAYMENT_METHODS = [
  { value: 'CASH_ON_DELIVERY', label: 'Cash on delivery', badge: 'COD', description: 'Pay when your order arrives' },
  { value: 'UPI', label: 'UPI', badge: 'UPI', description: 'Demo payment · no real charge' },
  { value: 'CREDIT_CARD', label: 'Credit card', badge: 'CC', description: 'Demo payment · no card details needed' },
  { value: 'DEBIT_CARD', label: 'Debit card', badge: 'DC', description: 'Demo payment · no card details needed' },
];

export default function Checkout({ cart, onPlaceOrder, onBack, submitting = false }) {
  const [method, setMethod] = useState('UPI');

  return (
    <div className="checkout-layout">
      <section className="summary checkout-summary" aria-labelledby="summary-heading">
        <div className="section-heading">
          <span className="eyebrow">YOUR SELECTION</span>
          <h2 id="summary-heading">Order summary</h2>
        </div>
        <ul className="plain checkout-items">
          {cart.items.map((item) => (
            <li className="checkout-item" key={item.bookId}>
              <span className="checkout-item-copy">
                <span className="title">{item.title}</span>
                <span className="note">Qty {item.quantity}</span>
              </span>
              <strong>{formatPrice(item.lineTotal)}</strong>
            </li>
          ))}
        </ul>
        <div className="checkout-total">
          <span>Total</span>
          <strong>{formatPrice(cart.total)}</strong>
        </div>
      </section>

      <section className="summary payment-panel" aria-labelledby="payment-heading">
        <div className="section-heading">
          <span className="eyebrow">PAYMENT METHOD</span>
          <h2 id="payment-heading">Choose how to pay</h2>
        </div>
        <p className="note payment-demo-note">
          Demo checkout only. Digital payments are simulated; no money will be charged.
        </p>
        <fieldset className="payment-options" disabled={submitting}>
          <legend className="visually-hidden">Payment method</legend>
          {PAYMENT_METHODS.map((option) => (
            <label
              className={`payment-option${method === option.value ? ' selected' : ''}`}
              key={option.value}
            >
              <input
                type="radio"
                name="payment-method"
                value={option.value}
                checked={method === option.value}
                onChange={() => setMethod(option.value)}
              />
              <span className="payment-badge" aria-hidden="true">{option.badge}</span>
              <span className="payment-option-copy">
                <span className="title">{option.label}</span>
                <span className="note">{option.description}</span>
              </span>
              <span className="payment-radio" aria-hidden="true" />
            </label>
          ))}
        </fieldset>
        <div className="checkout-actions">
          <button className="secondary" type="button" onClick={onBack} disabled={submitting}>
            Back to cart
          </button>
          <button
            className="cta checkout-submit"
            type="button"
            onClick={() => onPlaceOrder(method)}
            disabled={submitting || cart.items.length === 0}
          >
            {submitting ? 'Placing order…' : `Place order · ${formatPrice(cart.total)}`}
          </button>
        </div>
      </section>
    </div>
  );
}
