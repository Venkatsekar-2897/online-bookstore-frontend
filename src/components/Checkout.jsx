import { formatPrice } from '../format';

export default function Checkout({ cart, onPlaceOrder, onBack }) {
  return (
    <div className="summary">
      <h2>Order summary</h2>
      <ul className="plain">
        {cart.items.map((item) => (
          <li key={item.bookId}>
            {item.title} x {item.quantity} = {formatPrice(item.lineTotal)}
          </li>
        ))}
      </ul>
      <p className="total">{`Total: ${formatPrice(cart.total)}`}</p>
      <button className="secondary" onClick={onBack}>Back</button>
      <button className="cta" onClick={onPlaceOrder}>Place order</button>
    </div>
  );
}
