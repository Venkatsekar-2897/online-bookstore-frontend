import { formatPrice } from '../format';

function formatDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Date unavailable' : date.toLocaleString();
}

export default function OrderHistory({ history, loading, onPageChange }) {
  const orders = history?.content ?? [];
  const page = history?.number ?? 0;
  const totalPages = history?.totalPages ?? 0;

  if (!history) return loading ? <p role="status">Loading order history...</p> : null;
  if (!orders.length) return <p>You have no orders yet.</p>;

  return (
    <section aria-label="Order history">
      {orders.map((order) => (
        <article className="order-card" key={order.orderId}>
          <div className="order-header">
            <div>
              <h2>Order #{order.orderId}</h2>
              <p className="note">Placed {formatDate(order.createdAt)}</p>
            </div>
            <span className="order-status">{order.status}</span>
          </div>
          <ul className="plain order-items">
            {order.items.map((item) => (
              <li key={item.bookId}>
                {item.title} x {item.quantity} = {formatPrice(item.lineTotal)}
              </li>
            ))}
          </ul>
          <p className="total">Total: {formatPrice(order.total)}</p>
        </article>
      ))}
      {totalPages > 1 && (
        <nav className="pagination" aria-label="Order history pages">
          <button
            className="secondary"
            disabled={loading || page === 0}
            onClick={() => onPageChange(page - 1)}
          >
            Previous
          </button>
          <span>Page {page + 1} of {totalPages}</span>
          <button
            className="secondary"
            disabled={loading || page + 1 >= totalPages}
            onClick={() => onPageChange(page + 1)}
          >
            Next
          </button>
        </nav>
      )}
    </section>
  );
}
