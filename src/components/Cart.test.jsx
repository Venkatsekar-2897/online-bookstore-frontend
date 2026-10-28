import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import Cart from './Cart';

const cart = {
  items: [{ bookId: 1, title: 'Clean Code', author: 'Robert Martin', unitPrice: 30, quantity: 2, lineTotal: 60 }],
  total: 60,
};

describe('Cart', () => {
  it('shows a message when empty', () => {
    render(<Cart cart={{ items: [], total: 0 }} />);
    expect(screen.getByText('Your cart is empty.')).toBeInTheDocument();
  });

  it('shows items and the total', () => {
    render(<Cart cart={cart} />);
    expect(screen.getByText('Clean Code')).toBeInTheDocument();
    expect(screen.getByText('Total: $60.00')).toBeInTheDocument();
  });

  it('increases quantity', async () => {
    const onChangeQuantity = vi.fn();
    render(<Cart cart={cart} onChangeQuantity={onChangeQuantity} />);
    await userEvent.click(screen.getByRole('button', { name: 'Increase quantity of Clean Code' }));
    expect(onChangeQuantity).toHaveBeenCalledWith(1, 3);
  });

  it('does not allow decreasing below 1', () => {
    const single = { items: [{ ...cart.items[0], quantity: 1 }], total: 30 };
    render(<Cart cart={single} />);
    expect(screen.getByRole('button', { name: 'Decrease quantity of Clean Code' })).toBeDisabled();
  });

  it('removes an item', async () => {
    const onRemove = vi.fn();
    render(<Cart cart={cart} onRemove={onRemove} />);
    await userEvent.click(screen.getByRole('button', { name: 'Remove Clean Code' }));
    expect(onRemove).toHaveBeenCalledWith(1);
  });

  it('calls onCheckout', async () => {
    const onCheckout = vi.fn();
    render(<Cart cart={cart} onCheckout={onCheckout} />);
    await userEvent.click(screen.getByRole('button', { name: 'Checkout' }));
    expect(onCheckout).toHaveBeenCalled();
  });
});
