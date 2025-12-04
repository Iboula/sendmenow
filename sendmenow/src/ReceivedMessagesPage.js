import { useState, useEffect, useCallback } from 'react';
import './App.css';

function ReceivedMessagesPage({ loggedInUser, onBack }) {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedMessage, setSelectedMessage] = useState(null);

  const fetchMessages = useCallback(async () => {
    if (!loggedInUser) return;

    setIsLoading(true);
    setError('');

    try {
      const params = new URLSearchParams({
        userEmail: loggedInUser.userEmail,
        userId: loggedInUser.id
      });

      const response = await fetch(`http://localhost:5000/api/received-messages?${params}`);
      const data = await response.json();

      if (response.ok && data.success) {
        setMessages(data.messages || []);
      } else {
        setError(data.message || 'Failed to load messages');
      }
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError('Failed to connect to server. Please make sure the backend server is running.');
    } finally {
      setIsLoading(false);
    }
  }, [loggedInUser]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="App">
        <header className="App-header">
          <h1>Received Messages</h1>
          <div className="loading-container">
            <p>Loading messages...</p>
          </div>
          {onBack && (
            <button onClick={onBack} className="back-button">
              Back to Dashboard
            </button>
          )}
        </header>
      </div>
    );
  }

  if (error) {
    return (
      <div className="App">
        <header className="App-header">
          <h1>Received Messages</h1>
          <div className="message error">{error}</div>
          <button onClick={fetchMessages} className="submit-button">
            Try Again
          </button>
          {onBack && (
            <button onClick={onBack} className="back-button">
              Back to Dashboard
            </button>
          )}
        </header>
      </div>
    );
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>Received Messages</h1>
        <div className="messages-container">
          {messages.length === 0 ? (
            <div className="empty-messages">
              <p>No messages received yet.</p>
              <p>Messages sent to your email will appear here.</p>
            </div>
          ) : (
            <div className="messages-list">
              {messages.map((msg) => (
                <div key={msg.id} className="message-card">
                  <div className="message-header">
                    <div className="message-sender-info">
                      <h3>{msg.senderName}</h3>
                      <p className="sender-email">{msg.senderEmail}</p>
                      <p className="message-date">{formatDate(msg.sentAt)}</p>
                    </div>
                    {msg.subject && (
                      <div className="message-subject">
                        <strong>Subject:</strong> {msg.subject}
                      </div>
                    )}
                  </div>
                  
                  {msg.photoUrl && (
                    <div className="message-photo-container">
                      <img
                        src={`http://localhost:5000${msg.photoUrl}`}
                        alt={msg.photoOriginalName || 'Message photo'}
                        className="message-photo"
                        onClick={() => setSelectedMessage(msg)}
                      />
                    </div>
                  )}
                  
                  <div className="message-content">
                    <p>{msg.message}</p>
                  </div>
                  
                  <button
                    onClick={() => setSelectedMessage(msg)}
                    className="view-photo-button"
                    disabled={!msg.photoUrl}
                  >
                    {msg.photoUrl ? 'View Full Photo' : 'No Photo'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {onBack && (
          <button onClick={onBack} className="back-button">
            Back to Dashboard
          </button>
        )}
      </header>

      {/* Photo Modal */}
      {selectedMessage && selectedMessage.photoUrl && (
        <div className="photo-modal" onClick={() => setSelectedMessage(null)}>
          <div className="photo-modal-content" onClick={(e) => e.stopPropagation()}>
            <button
              className="close-modal-button"
              onClick={() => setSelectedMessage(null)}
            >
              ×
            </button>
            <h3>From: {selectedMessage.senderName}</h3>
            <img
              src={`http://localhost:5000${selectedMessage.photoUrl}`}
              alt={selectedMessage.photoOriginalName || 'Message photo'}
              className="modal-photo"
            />
            <p className="modal-message">{selectedMessage.message}</p>
            <p className="modal-date">{formatDate(selectedMessage.sentAt)}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default ReceivedMessagesPage;

