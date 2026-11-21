import { useState } from 'react';

const AUTH_URL = 'http://localhost:5000/auth';

function Auth({ onAuthSuccess }) {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const endpoint = isRegister ? `${AUTH_URL}/register` : `${AUTH_URL}/login`;
    const payload = isRegister
      ? { name, email, password }
      : { email, password };

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      // Save token and user details to localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      // Inform parent component (App.jsx)
      onAuthSuccess(data.token, data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <div className="header">
        <h1>🎓 Student Task Manager</h1>
        <p>Sign in to access and manage your private study tasks</p>
      </div>

      {/* Switch between Login and Register */}
      <div className="auth-tabs">
        <button
          type="button"
          className={`auth-tab ${!isRegister ? 'active' : ''}`}
          onClick={() => {
            setIsRegister(false);
            setError('');
          }}
        >
          Login
        </button>
        <button
          type="button"
          className={`auth-tab ${isRegister ? 'active' : ''}`}
          onClick={() => {
            setIsRegister(true);
            setError('');
          }}
        >
          Register
        </button>
      </div>

      {/* Error Message */}
      {error && <div className="auth-error">⚠️ {error}</div>}

      {/* Auth Form */}
      <form onSubmit={handleSubmit} className="auth-form">
        {isRegister && (
          <div className="form-group">
            <label htmlFor="name">Your Name</label>
            <input
              id="name"
              type="text"
              className="form-input"
              placeholder="e.g. Mohit Saraswat"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required={isRegister}
            />
          </div>
        )}

        <div className="form-group">
          <label htmlFor="email">Email Address</label>
          <input
            id="email"
            type="email"
            className="form-input"
            placeholder="student@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password (min 6 characters)</label>
          <input
            id="password"
            type="password"
            className="form-input"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />
        </div>

        <button type="submit" className="auth-submit-btn" disabled={loading}>
          {loading ? 'Please wait...' : isRegister ? 'Create Account' : 'Sign In'}
        </button>
      </form>
    </div>
  );
}

export default Auth;
