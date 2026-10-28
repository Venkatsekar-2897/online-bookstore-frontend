import { formatPrice } from '../format';
import Cover from './Cover';

export default function BookList({ books, onAdd }) {
  return (
    <ul className="grid">
      {books.map((book) => {
        const soldOut = book.stock <= 0;
        return (
          <li key={book.id} className="tile">
            <Cover book={book} />
            <div className="info">
              <div className="title">{book.title}</div>
              <div className="author">{book.author}</div>
              <div className="price">{formatPrice(book.price)}</div>
              {book.stock > 0 && book.stock <= 5 && <div className="stock-low">Only {book.stock} left</div>}
            </div>
            <button
              className="cta"
              disabled={soldOut}
              aria-label={soldOut ? undefined : `Add ${book.title} to cart`}
              onClick={() => onAdd(book)}
            >
              {soldOut ? 'Out of stock' : 'Add to cart'}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
