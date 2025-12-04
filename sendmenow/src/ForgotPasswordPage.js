import { useState } from 'react';
import './App.css';

function ForgotPasswordPage({ onBack }) {
  const [userEmail, setUserEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      const response = await fetch('http://localhost:5000/api/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userEmail,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setMessage('Password reset link has been sent to your email. Please check your inbox.');
        setUserEmail('');
      } else {
        setMessage(data.message || 'Failed to send reset link');
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
        <h1>Forgot Password</h1>
        <form onSubmit={handleSubmit} className="form-container">
          <div className="form-group">
            <label htmlFor="resetEmail">Enter your email address:</label>
            <input
              type="email"
              id="resetEmail"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              required
              autoComplete="email"
              placeholder="your@email.com"
            />
          </div>
          <button type="submit" className="submit-button" disabled={isLoading}>
            {isLoading ? 'Sending...' : 'Send Reset Link'}
          </button>
          {message && (
            <div className={`message ${message.includes('sent') ? 'success' : 'error'}`}>
              {message}
            </div>
          )}
          <div className="switch-link">
            <button type="button" onClick={onBack} className="link-button">Back to Login</button>
          </div>
        </form>
      </header>
    </div>
  );
}

export default ForgotPasswordPage;
