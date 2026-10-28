import { formatPrice } from '../format';
import Cover from './Cover';

// cart = { items: [{ bookId, title, author, unitPrice, quantity, lineTotal }], total }
export default function Cart({ cart, onChangeQuantity, onRemove, onCheckout }) {
  if (cart.items.length === 0) {
    return <p>Your cart is empty.</p>;
  }

  return (
    <div>
      {cart.items.map((item) => (
        <div className="row" key={item.bookId}>
          <Cover book={{ id: item.bookId, title: item.title }} small />
          <div className="row-info">
            <div className="title">{item.title}</div>
            <div className="author">{formatPrice(item.unitPrice)} each</div>
            <div className="qty">
              <button
                aria-label={`Decrease quantity of ${item.title}`}
                disabled={item.quantity <= 1}
                onClick={() => onChangeQuantity(item.bookId, item.quantity - 1)}
              >
                -
              </button>
              <span>Qty: {item.quantity}</span>
              <button
                aria-label={`Increase quantity of ${item.title}`}
                onClick={() => onChangeQuantity(item.bookId, item.quantity + 1)}
              >
                +
              </button>
              <button className="link" aria-label={`Remove ${item.title}`} onClick={() => onRemove(item.bookId)}>
                Remove
              </button>
            </div>
          </div>
        </div>
      ))}
      <div className="summary">
        <p className="total">{`Total: ${formatPrice(cart.total)}`}</p>
        <button className="cta" onClick={onCheckout}>Checkout</button>
      </div>
    </div>
  );
}
