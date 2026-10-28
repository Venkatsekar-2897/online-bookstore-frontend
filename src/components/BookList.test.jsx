import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import BookList from './BookList';

const books = [
  { id: 1, title: 'Clean Code', author: 'Robert Martin', price: 30, stock: 10 },
  { id: 2, title: 'Refactoring', author: 'Martin Fowler', price: 45.5, stock: 3 },
  { id: 3, title: 'Old Book', author: 'Someone', price: 10, stock: 0 },
];

describe('BookList', () => {
  it('shows title, author and price of each book', () => {
    render(<BookList books={books} onAdd={() => {}} />);
    expect(screen.getByText('Clean Code')).toBeInTheDocument();
    expect(screen.getByText('Martin Fowler')).toBeInTheDocument();
    expect(screen.getByText('$45.50')).toBeInTheDocument();
  });

  it('warns when stock is low', () => {
    render(<BookList books={books} onAdd={() => {}} />);
    expect(screen.getByText('Only 3 left')).toBeInTheDocument();
  });

  it('disables the button when out of stock', () => {
    render(<BookList books={books} onAdd={() => {}} />);
    expect(screen.getByRole('button', { name: 'Out of stock' })).toBeDisabled();
  });

  it('calls onAdd with the book when Add to cart is clicked', async () => {
    const onAdd = vi.fn();
    render(<BookList books={books} onAdd={onAdd} />);
    await userEvent.click(screen.getByRole('button', { name: 'Add Clean Code to cart' }));
    expect(onAdd).toHaveBeenCalledWith(books[0]);
  });
});
