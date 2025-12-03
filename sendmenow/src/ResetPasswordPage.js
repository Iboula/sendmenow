import { useState, useEffect } from 'react';
import './App.css';

function ResetPasswordPage({ onBack }) {
  const [token, setToken] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Get token and email from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const tokenParam = urlParams.get('token');
    const emailParam = urlParams.get('email');
    
    if (tokenParam) {
      setToken(tokenParam);
    }
    if (emailParam) {
      setUserEmail(decodeURIComponent(emailParam));
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!token || !userEmail) {
      setMessage('Invalid reset link. Please request a new password reset.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setMessage('Password must be at least 6 characters long');
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      const response = await fetch('http://localhost:5000/api/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          userEmail,
          newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setMessage('Password has been reset successfully! Redirecting to login...');
        // Redirect to login after 2 seconds
        setTimeout(() => {
          if (onBack) {
            onBack();
          } else {
            window.location.href = '/';
          }
        }, 2000);
      } else {
        setMessage(data.message || 'Failed to reset password');
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
        <h1>Reset Password</h1>
        <form onSubmit={handleSubmit} className="form-container">
          <div className="form-group">
            <label htmlFor="resetEmail">Email:</label>
            <input
              type="email"
              id="resetEmail"
              value={userEmail}
              readOnly
              className="readonly-input"
            />
          </div>
          <div className="form-group">
            <label htmlFor="newPassword">New Password:</label>
            <input
              type="password"
              id="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              autoComplete="new-password"
              minLength={6}
              placeholder="Enter new password (min 6 characters)"
            />
          </div>
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password:</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              autoComplete="new-password"
              minLength={6}
              placeholder="Confirm new password"
            />
          </div>
          <button type="submit" className="submit-button" disabled={isLoading || !token}>
            {isLoading ? 'Resetting...' : 'Reset Password'}
          </button>
          {message && (
            <div className={`message ${message.includes('successfully') ? 'success' : 'error'}`}>
              {message}
            </div>
          )}
          {onBack && (
            <div className="switch-link">
              <button type="button" onClick={onBack} className="link-button">Back to Login</button>
            </div>
          )}
        </form>
      </header>
    </div>
  );
}

export default ResetPasswordPage;

