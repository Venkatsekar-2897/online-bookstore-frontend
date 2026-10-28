import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import Header from './Header';

describe('Header', () => {
  it('shows the item count on the cart icon', () => {
    render(<Header count={3} user={null} />);
    expect(screen.getByRole('button', { name: 'Open cart (3)' })).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('hides the badge when the cart is empty', () => {
    render(<Header count={0} user={null} />);
    expect(screen.queryByText('0')).not.toBeInTheDocument();
  });

  it('calls onCart when the cart icon is clicked', async () => {
    const onCart = vi.fn();
    render(<Header count={0} user={null} onCart={onCart} />);
    await userEvent.click(screen.getByRole('button', { name: 'Open cart (0)' }));
    expect(onCart).toHaveBeenCalled();
  });

  it('shows Sign in when logged out', () => {
    render(<Header count={0} user={null} />);
    expect(screen.getByRole('button', { name: 'Sign in' })).toBeInTheDocument();
  });

  it('shows the first name and Log out when logged in', async () => {
    const onLogout = vi.fn();
    render(<Header count={0} user={{ fullName: 'Asha Kumar', email: 'a@b.com' }} onLogout={onLogout} />);
    expect(screen.getByText('Hi, Asha')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Log out' }));
    expect(onLogout).toHaveBeenCalled();
  });

  it('shows the theme toggle and calls its handler', async () => {
    const onToggleTheme = vi.fn();
    render(<Header count={0} user={null} theme="light" onToggleTheme={onToggleTheme} />);
    await userEvent.click(screen.getByRole('button', { name: 'Switch to dark theme' }));
    expect(onToggleTheme).toHaveBeenCalled();
  });
});
