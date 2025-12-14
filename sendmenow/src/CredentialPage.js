import { useState } from 'react';
import './App.css';
import API_BASE_URL from './config';

function CredentialPage({ onLogin, onSwitchToRegister, onForgotPassword }) {
  const [userName, setUserName] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userName,
          userPassword,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setMessage('Login successful!');
        // Call the onLogin callback with user data
        if (onLogin) {
          onLogin(data.user, data.token);
        }
        // Reset form
        setUserName('');
        setUserPassword('');
      } else {
        setMessage(data.message || 'Invalid username or password');
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('Failed to connect to server. Please make sure the backend server is running.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Login</h1>
        <form onSubmit={handleSubmit} className="form-container">
          <div className="form-group">
            <label htmlFor="loginUserName">Username:</label>
            <input
              type="text"
              id="loginUserName"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              required
              autoComplete="username"
            />
          </div>
          <div className="form-group">
            <label htmlFor="loginPassword">Password:</label>
            <input
              type="password"
              id="loginPassword"
              value={userPassword}
              onChange={(e) => setUserPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>
          <button type="submit" className="submit-button" disabled={isLoading}>
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
          {message && (
            <div className={`message ${message.includes('successful') ? 'success' : 'error'}`}>
              {message}
            </div>
          )}
          <div className="switch-link">
            <p>Don't have an account? <button type="button" onClick={onSwitchToRegister} className="link-button">Register here</button></p>
            <p style={{ marginTop: '10px' }}>
              <button type="button" onClick={onForgotPassword} className="link-button">Forgot Password?</button>
            </p>
          </div>
        </form>
      </header>
    </div>
  );
}

export default CredentialPage;


