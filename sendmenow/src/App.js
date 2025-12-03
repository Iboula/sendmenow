import { useState, useEffect } from 'react';
import './App.css';
import CredentialPage from './CredentialPage';
import PhotoSendPage from './PhotoSendPage';

function App() {
  const [currentPage, setCurrentPage] = useState('login'); // 'login', 'register', or 'dashboard'
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Check for existing authentication on component mount
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const savedToken = localStorage.getItem('token');
    
    if (savedUser && savedToken) {
      try {
        const user = JSON.parse(savedUser);
        setIsAuthenticated(true);
        setLoggedInUser(user);
        setCurrentPage('dashboard');
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
  }, []);

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      const response = await fetch('http://localhost:5000/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userName,
          userEmail,
          userPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('User registered successfully! Please login.');
        // Reset form
        setUserName('');
        setUserEmail('');
        setUserPassword('');
        // Switch to login page after 2 seconds
        setTimeout(() => {
          setCurrentPage('login');
          setMessage('');
        }, 2000);
      } else {
        setMessage(data.message || 'Error registering user');
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('Failed to connect to server. Please make sure the backend server is running.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = (user, token) => {
    // Save to localStorage
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('token', token);
    
    // Update state
    setIsAuthenticated(true);
    setLoggedInUser(user);
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    // Clear localStorage
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    
    // Reset state
    setIsAuthenticated(false);
    setLoggedInUser(null);
    setCurrentPage('login');
    setUserName('');
    setUserEmail('');
    setUserPassword('');
    setMessage('');
  };

  // Photo Send Page
  if (isAuthenticated && loggedInUser && currentPage === 'send-photo') {
    return (
      <PhotoSendPage
        loggedInUser={loggedInUser}
        onBack={() => setCurrentPage('dashboard')}
      />
    );
  }

  // Dashboard/Welcome screen for authenticated users
  if (isAuthenticated && loggedInUser && currentPage === 'dashboard') {
    return (
      <div className="App">
        <header className="App-header">
          <h1>Welcome, {loggedInUser.userName}!</h1>
          <div className="welcome-container">
            <p>Email: {loggedInUser.userEmail}</p>
            <p>User ID: {loggedInUser.id}</p>
            <button 
              onClick={() => setCurrentPage('send-photo')} 
              className="submit-button"
            >
              Send Photo with Message
            </button>
            <button onClick={handleLogout} className="submit-button">
              Logout
            </button>
          </div>
        </header>
      </div>
    );
  }

  // Show CredentialPage (Login) if on login page
  if (currentPage === 'login') {
    return (
      <CredentialPage 
        onLogin={handleLogin}
        onSwitchToRegister={() => {
          setCurrentPage('register');
          setMessage('');
        }}
      />
    );
  }

  // Registration form
  return (
    <div className="App">
      <header className="App-header">
        <h1>User Registration</h1>
        <form onSubmit={handleRegister} className="form-container">
          <div className="form-group">
            <label htmlFor="userName">User Name:</label>
            <input
              type="text"
              id="userName"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              required
              autoComplete="username"
            />
          </div>
          <div className="form-group">
            <label htmlFor="userEmail">User Email:</label>
            <input
              type="email"
              id="userEmail"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>
          <div className="form-group">
            <label htmlFor="userPassword">Password:</label>
            <input
              type="password"
              id="userPassword"
              value={userPassword}
              onChange={(e) => setUserPassword(e.target.value)}
              required
              autoComplete="new-password"
            />
          </div>
          <button type="submit" className="submit-button" disabled={isLoading}>
            {isLoading ? 'Registering...' : 'Register'}
          </button>
          {message && (
            <div className={`message ${message.includes('successfully') ? 'success' : 'error'}`}>
              {message}
            </div>
          )}
          <div className="switch-link">
            <p>Already have an account? <button type="button" onClick={() => setCurrentPage('login')} className="link-button">Login here</button></p>
          </div>
        </form>
      </header>
    </div>
  );
}

export default App;
