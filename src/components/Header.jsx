export default function Header({
  count, user, onHome, onCart, onOrders, onLogin, onLogout, theme = 'light', onToggleTheme,
}) {
  return (
    <header className="header">
      <button className="logo" onClick={onHome}>Online Bookstore</button>
      <div className="header-right">
        {user ? (
          <>
            <span className="hello">Hi, {user.fullName.split(' ')[0]}</span>
            <button className="header-link" onClick={onOrders}>Order history</button>
            <button className="header-link" onClick={onLogout}>Log out</button>
          </>
        ) : (
          <button className="header-link" onClick={onLogin}>Sign in</button>
        )}
        <button
          className="theme-toggle"
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
          onClick={onToggleTheme}
        >
          <span aria-hidden="true">{theme === 'light' ? '☾' : '☀'}</span>
          <span>{theme === 'light' ? 'Dark' : 'Light'} mode</span>
        </button>
        <button className="cart-btn" aria-label={`Open cart (${count})`} onClick={onCart}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49A1 1 0 0 0 20 4H5.21l-.94-2H1zm16 16c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
          </svg>
          {count > 0 && <span className="badge">{count}</span>}
        </button>
      </div>
    </header>
  );
}
