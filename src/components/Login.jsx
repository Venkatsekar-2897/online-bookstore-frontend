import { useState } from 'react';

export default function Login({ notice, onLogin, onRegister }) {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const isRegister = mode === 'register';

  function handleSubmit(event) {
    event.preventDefault();
    if (isRegister) onRegister(fullName, email, password);
    else onLogin(email, password);
  }

  return (
    <form className="summary form" onSubmit={handleSubmit}>
      <h1>{isRegister ? 'Create account' : 'Log in'}</h1>
      {notice && <p className="note">{notice}</p>}

      {isRegister && (
        <label>
          Full name
          <input value={fullName} onChange={(e) => setFullName(e.target.value)} required maxLength={100} />
        </label>
      )}
      <label>
        Email
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </label>
      <label>
        Password
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={isRegister ? 8 : undefined}
        />
      </label>

      <button className="cta" type="submit">{isRegister ? 'Register' : 'Log in'}</button>{' '}
      <button className="link" type="button" onClick={() => setMode(isRegister ? 'login' : 'register')}>
        {isRegister ? 'I already have an account' : 'Create an account'}
      </button>
    </form>
  );
}
