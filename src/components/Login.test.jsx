import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import Login from './Login';

describe('Login', () => {
  it('submits email and password', async () => {
    const onLogin = vi.fn();
    render(<Login onLogin={onLogin} onRegister={() => {}} />);
    await userEvent.type(screen.getByLabelText('Email'), 'test@example.com');
    await userEvent.type(screen.getByLabelText('Password'), 'password123');
    await userEvent.click(screen.getByRole('button', { name: 'Log in' }));
    expect(onLogin).toHaveBeenCalledWith('test@example.com', 'password123');
  });

  it('switches to registration and submits the full name too', async () => {
    const onRegister = vi.fn();
    render(<Login onLogin={() => {}} onRegister={onRegister} />);
    await userEvent.click(screen.getByRole('button', { name: 'Create an account' }));
    await userEvent.type(screen.getByLabelText('Full name'), 'Test User');
    await userEvent.type(screen.getByLabelText('Email'), 'test@example.com');
    await userEvent.type(screen.getByLabelText('Password'), 'password123');
    await userEvent.click(screen.getByRole('button', { name: 'Register' }));
    expect(onRegister).toHaveBeenCalledWith('Test User', 'test@example.com', 'password123');
  });

  it('shows the notice', () => {
    render(<Login notice="Please log in first" onLogin={() => {}} onRegister={() => {}} />);
    expect(screen.getByText('Please log in first')).toBeInTheDocument();
  });
});
